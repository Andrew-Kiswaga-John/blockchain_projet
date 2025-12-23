const { Gateway, Wallets, DefaultQueryHandlerStrategies } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricClient {
    constructor() {
        this.gateways = {}; // Map<orgName, Gateway>
        this.wallet = null;
        this.networks = {}; // Map<channelName, Network> (Default org)
        // Use absolute path for WSL environment
        this.networkPath = process.env.NETWORK_PATH || path.resolve(__dirname, '../../../../network');

        this.orgConfig = {
            'TrafficAuthority': { msp: 'TrafficAuthorityMSP', peer: 'peer0.trafficauthority.example.com', ca: 'trafficauthority' },
            'EmergencyServices': { msp: 'EmergencyServicesMSP', peer: 'peer0.emergency.example.com', ca: 'emergency' },
            'InfrastructureOperator': { msp: 'InfrastructureOperatorMSP', peer: 'peer0.infrastructure.example.com', ca: 'infrastructure' },
            'VehicleOperator': { msp: 'VehicleOperatorMSP', peer: 'peer0.vehicleoperator.example.com', ca: 'vehicleoperator' },
            'ParkingManagement': { msp: 'ParkingManagementMSP', peer: 'peer0.parking.example.com', ca: 'parking' }
        };
    }

    async initialize() {
        try {
            // Create wallet
            const walletPath = path.join(__dirname, '../../wallet');
            this.wallet = await Wallets.newFileSystemWallet(walletPath);

            // Enroll Admins for all organizations
            for (const [orgName, config] of Object.entries(this.orgConfig)) {
                const identityLabel = `admin-${config.ca}`;
                const exists = await this.wallet.get(identityLabel);
                if (!exists) {
                    await this.enrollAdmin(orgName, config.ca, config.msp);
                }
            }

            // Connect default gateway (TrafficAuthority)
            await this.connectGateway('TrafficAuthority');

            console.log('✓ Fabric client initialized with multi-org support');
        } catch (error) {
            console.error('Failed to initialize Fabric client:', error);
            throw error;
        }
    }

    async enrollAdmin(orgName, listName, mspId) {
        try {
            const orgLower = listName; // e.g. trafficauthority
            const mspPath = `${this.networkPath}/organizations/peerOrganizations/${orgLower}.example.com/users/Admin@${orgLower}.example.com/msp`;
            const adminCertPath = `${mspPath}/signcerts/Admin@${orgLower}.example.com-cert.pem`;
            const adminKeyDir = `${mspPath}/keystore`;

            if (!fs.existsSync(adminCertPath)) {
                console.warn(`Skipping enrollment for ${orgName}: Crypto materials not found at ${adminCertPath}`);
                return;
            }

            const certificate = fs.readFileSync(adminCertPath).toString();
            const keyFiles = fs.readdirSync(adminKeyDir);
            const privateKey = fs.readFileSync(path.join(adminKeyDir, keyFiles[0])).toString();

            const x509Identity = {
                credentials: {
                    certificate,
                    privateKey,
                },
                mspId: mspId,
                type: 'X.509',
            };

            await this.wallet.put(`admin-${orgLower}`, x509Identity);
            console.log(`✓ Admin identity loaded for ${orgName}`);
        } catch (error) {
            console.error(`Failed to enroll admin for ${orgName}:`, error);
        }
    }

    async connectGateway(orgName) {
        if (this.gateways[orgName]) {
            return this.gateways[orgName];
        }

        try {
            const config = this.orgConfig[orgName];
            if (!config) throw new Error(`Unknown Organization: ${orgName}`);

            const identityLabel = `admin-${config.ca}`;
            const exists = await this.wallet.get(identityLabel);

            if (!exists) {
                console.warn(`Cannot connect as ${orgName}: Identity ${identityLabel} not in wallet.`);
                return null;
            }

            const connectionProfile = this.createConnectionProfile(orgName);
            const gateway = new Gateway();

            await gateway.connect(connectionProfile, {
                wallet: this.wallet,
                identity: identityLabel,
                discovery: { enabled: false },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_SINGLE
                }
            });

            this.gateways[orgName] = gateway;
            console.log(`✓ Gateway connected for ${orgName}`);
            return gateway;
        } catch (error) {
            console.error(`Failed to connect gateway for ${orgName}:`, error);
            throw error;
        }
    }

    createConnectionProfile(orgName) {
        // Load the common connection profile or build it dynamically
        // For simplicity, we assume we can read the org-specific profile from the network folder implies
        const orgLower = this.orgConfig[orgName].ca;
        const profilePath = path.join(this.networkPath, 'organizations', 'peerOrganizations', `${orgLower}.example.com`, `connection-${orgLower}.json`);

        if (fs.existsSync(profilePath)) {
            const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
            return profile;
        }

        throw new Error(`Connection profile not found for ${orgName} at ${profilePath}`);
    }

    async getContract(channelName, contractName, orgName = 'TrafficAuthority') {
        const gateway = await this.connectGateway(orgName);
        const network = await gateway.getNetwork(channelName);
        return network.getContract(contractName);
    }

    async disconnect() {
        for (const [org, gateway] of Object.entries(this.gateways)) {
            gateway.disconnect();
            console.log(`✓ Disconnected gateway for ${org}`);
        }
        this.gateways = {};
    }
}

module.exports = new FabricClient();
