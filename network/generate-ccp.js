const fs = require('fs');
const path = require('path');

const organizations = [
    { name: 'TrafficAuthority', domain: 'trafficauthority.example.com', port: 7051, caPort: 8054, caName: 'ca-trafficauthority', suffix: 'trafficauthority' },
    { name: 'VehicleOperator', domain: 'vehicleoperator.example.com', port: 9051, caPort: 9054, caName: 'ca-vehicleoperator', suffix: 'vehicleoperator' },
    { name: 'InfrastructureOperator', domain: 'infrastructure.example.com', port: 11051, caPort: 10054, caName: 'ca-infrastructure', suffix: 'infrastructure' },
    { name: 'EmergencyServices', domain: 'emergency.example.com', port: 13051, caPort: 11054, caName: 'ca-emergency', suffix: 'emergency' },
    { name: 'ParkingManagement', domain: 'parking.example.com', port: 15051, caPort: 12054, caName: 'ca-parking', suffix: 'parking' }
];

const orderers = [
    { name: 'orderer0.example.com', port: 7050 },
    { name: 'orderer1.example.com', port: 8050 },
    { name: 'orderer2.example.com', port: 9050 }
];

function generateProfile(currentOrg) {
    const profile = {
        name: `traffic-network-${currentOrg.name.toLowerCase()}`,
        version: "1.0.0",
        client: {
            organization: currentOrg.name,
            connection: { timeout: { peer: { endorser: "300" } } }
        },
        channels: {
            "city-traffic-global": {
                orderers: orderers.map(o => o.name),
                peers: {}
            },
            "emergency-ops": {
                orderers: orderers.map(o => o.name),
                peers: {}
            }
        },
        organizations: {},
        orderers: {},
        peers: {},
        certificateAuthorities: {}
    };

    // 1. Populate ALL Organizations and Peers
    organizations.forEach(org => {
        profile.organizations[org.name] = {
            mspid: `${org.name}MSP`,
            peers: [`peer0.${org.domain}`],
            certificateAuthorities: [`ca.${org.domain}`]
        };

        const orgPath = path.resolve(__dirname, 'organizations', 'peerOrganizations', org.domain);
        const peerPemPath = path.join(orgPath, 'peers', `peer0.${org.domain}`, 'tls', 'ca.crt');
        const caPemPath = path.join(orgPath, 'ca', `ca.${org.domain}-cert.pem`);

        if (fs.existsSync(peerPemPath)) {
            const peerPem = fs.readFileSync(peerPemPath, 'utf8');
            profile.peers[`peer0.${org.domain}`] = {
                url: `grpcs://localhost:${org.port}`,
                tlsCACerts: { pem: peerPem },
                grpcOptions: {
                    "ssl-target-name-override": `peer0.${org.domain}`,
                    "hostnameOverride": `peer0.${org.domain}`
                }
            };

            // Add to BOTH channels
            profile.channels["city-traffic-global"].peers[`peer0.${org.domain}`] = {
                endorsingPeer: true,
                chaincodeQuery: true,
                ledgerQuery: true,
                eventSource: true
            };
            profile.channels["emergency-ops"].peers[`peer0.${org.domain}`] = {
                endorsingPeer: true,
                chaincodeQuery: true,
                ledgerQuery: true,
                eventSource: true
            };
        }

        if (fs.existsSync(caPemPath)) {
            const caPem = fs.readFileSync(caPemPath, 'utf8');
            profile.certificateAuthorities[`ca.${org.domain}`] = {
                url: `https://localhost:${org.caPort}`,
                caName: org.caName,
                tlsCACerts: { pem: caPem },
                httpOptions: { verify: false }
            };
        }
    });

    // 2. Populate Orderers
    orderers.forEach(orderer => {
        profile.orderers[orderer.name] = {
            url: `grpcs://localhost:${orderer.port}`,
            tlsCACerts: {
                path: path.resolve(__dirname, `organizations/ordererOrganizations/example.com/orderers/${orderer.name}/tls/ca.crt`)
            },
            grpcOptions: { "ssl-target-name-override": orderer.name }
        };
    });

    return JSON.stringify(profile, null, 4);
}

organizations.forEach(org => {
    const jsonContent = generateProfile(org);
    if (jsonContent) {
        // Output path suffix MUST match fabricClient.js orgConfig suffixes
        const outputPath = path.resolve(__dirname, 'organizations', 'peerOrganizations', org.domain, `connection-${org.suffix}.json`);
        try {
            fs.writeFileSync(outputPath, jsonContent);
            console.log(`Successfully generated connection profile: connection-${org.suffix}.json`);
        } catch (e) {
            console.error(`Failed to write ${outputPath}: ${e.message}`);
        }
    }
});
