const { Gateway, Wallets, DefaultQueryHandlerStrategies } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricClient {
    constructor() {
        this.gateway = null;
        this.wallet = null;
        this.networks = {};
        // Use absolute path for WSL environment
        this.networkPath = process.env.NETWORK_PATH || path.resolve(__dirname, '../../../../network');
    }

    async initialize() {
        try {
            // Create wallet
            const walletPath = path.join(__dirname, '../../wallet');
            this.wallet = await Wallets.newFileSystemWallet(walletPath);

            // Check if admin identity exists
            const adminExists = await this.wallet.get('admin');
            if (!adminExists) {
                await this.enrollAdmin();
            }

            // Connect gateway once
            await this.connectGateway();

            console.log('✓ Fabric client initialized');
        } catch (error) {
            console.error('Failed to initialize Fabric client:', error);
            throw error;
        }
    }

    async enrollAdmin() {
        try {
            const orgName = 'trafficauthority';
            const mspPath = `${this.networkPath}/organizations/peerOrganizations/${orgName}.example.com/users/Admin@${orgName}.example.com/msp`;
            const adminCertPath = `${mspPath}/signcerts/Admin@${orgName}.example.com-cert.pem`;
            const adminKeyDir = `${mspPath}/keystore`;
            const caCertPath = `${mspPath}/cacerts/ca.${orgName}.example.com-cert.pem`;
            
            const certificate = fs.readFileSync(adminCertPath).toString();
            const keyFiles = fs.readdirSync(adminKeyDir);
            const privateKey = fs.readFileSync(path.join(adminKeyDir, keyFiles[0])).toString();
            const caCert = fs.readFileSync(caCertPath).toString();

            const x509Identity = {
                credentials: {
                    certificate,
                    privateKey,
                },
                mspId: 'TrafficAuthorityMSP',
                type: 'X.509',
            };

            await this.wallet.put('admin', x509Identity);
            console.log('✓ Admin identity loaded successfully');
        } catch (error) {
            console.error('Failed to enroll admin:', error);
            throw error;
        }
    }

    async connectGateway() {
        try {
            const orgName = 'trafficauthority';
            const peerPath = `${this.networkPath}/organizations/peerOrganizations/${orgName}.example.com`;
            const emergencyPath = `${this.networkPath}/organizations/peerOrganizations/emergency.example.com`;
            const infraPath = `${this.networkPath}/organizations/peerOrganizations/infrastructure.example.com`;
            const vehiclePath = `${this.networkPath}/organizations/peerOrganizations/vehicleoperator.example.com`;
            const parkingPath = `${this.networkPath}/organizations/peerOrganizations/parking.example.com`;
            
            const connectionProfile = {
                name: 'traffic-core-network',
                version: '1.0.0',
                client: {
                    organization: 'TrafficAuthority',
                    connection: {
                        timeout: {
                            peer: { endorser: '300' },
                            orderer: '300'
                        }
                    }
                },
                organizations: {
                    TrafficAuthority: {
                        mspid: 'TrafficAuthorityMSP',
                        peers: ['peer0.trafficauthority.example.com'],
                        certificateAuthorities: ['ca.trafficauthority.example.com']
                    }
                },
                orderers: {
                    'orderer0.example.com': {
                        url: 'grpcs://localhost:7050',
                        tlsCACerts: {
                            pem: fs.readFileSync(`${this.networkPath}/organizations/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/ca.crt`).toString()
                        },
                        grpcOptions: {
                            'ssl-target-name-override': 'orderer0.example.com',
                            'hostnameOverride': 'orderer0.example.com'
                        }
                    }
                },
                channels: {
                    'city-traffic-global': {
                        orderers: ['orderer0.example.com'],
                        peers: {
                            'peer0.trafficauthority.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true },
                            'peer0.emergency.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true },
                            'peer0.infrastructure.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true },
                            'peer0.vehicleoperator.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true },
                            'peer0.parking.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true }
                        }
                    },
                    'emergency-ops': {
                        orderers: ['orderer0.example.com'],
                        peers: {
                            'peer0.trafficauthority.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true },
                            'peer0.emergency.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true },
                            'peer0.infrastructure.example.com': { endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true, eventSource: true }
                        }
                    }
                },
                peers: {
                    'peer0.trafficauthority.example.com': {
                        url: 'grpcs://localhost:7051',
                        tlsCACerts: {
                            pem: fs.readFileSync(`${peerPath}/peers/peer0.trafficauthority.example.com/tls/ca.crt`).toString()
                        },
                        grpcOptions: {
                            'ssl-target-name-override': 'peer0.trafficauthority.example.com',
                            'hostnameOverride': 'peer0.trafficauthority.example.com'
                        }
                    },
                    'peer0.emergency.example.com': {
                        url: 'grpcs://localhost:13051',
                        tlsCACerts: {
                            pem: fs.readFileSync(`${emergencyPath}/peers/peer0.emergency.example.com/tls/ca.crt`).toString()
                        },
                        grpcOptions: {
                            'ssl-target-name-override': 'peer0.emergency.example.com',
                            'hostnameOverride': 'peer0.emergency.example.com'
                        }
                    },
                    'peer0.infrastructure.example.com': {
                        url: 'grpcs://localhost:11051',
                        tlsCACerts: {
                            pem: fs.readFileSync(`${infraPath}/peers/peer0.infrastructure.example.com/tls/ca.crt`).toString()
                        },
                        grpcOptions: {
                            'ssl-target-name-override': 'peer0.infrastructure.example.com',
                            'hostnameOverride': 'peer0.infrastructure.example.com'
                        }
                    },
                    'peer0.vehicleoperator.example.com': {
                        url: 'grpcs://localhost:9051',
                        tlsCACerts: {
                            pem: fs.readFileSync(`${vehiclePath}/peers/peer0.vehicleoperator.example.com/tls/ca.crt`).toString()
                        },
                        grpcOptions: {
                            'ssl-target-name-override': 'peer0.vehicleoperator.example.com',
                            'hostnameOverride': 'peer0.vehicleoperator.example.com'
                        }
                    },
                    'peer0.parking.example.com': {
                        url: 'grpcs://localhost:15051',
                        tlsCACerts: {
                            pem: fs.readFileSync(`${parkingPath}/peers/peer0.parking.example.com/tls/ca.crt`).toString()
                        },
                        grpcOptions: {
                            'ssl-target-name-override': 'peer0.parking.example.com',
                            'hostnameOverride': 'peer0.parking.example.com'
                        }
                    }
                },
                certificateAuthorities: {
                    'ca.trafficauthority.example.com': {
                        url: 'https://localhost:7054',
                        caName: `ca.${orgName}.example.com`,
                        tlsCACerts: {
                            pem: fs.readFileSync(`${peerPath}/ca/ca.${orgName}.example.com-cert.pem`).toString()
                        }
                    }
                }
            };

            this.gateway = new Gateway();
            await this.gateway.connect(connectionProfile, {
                wallet: this.wallet,
                identity: 'admin',
                discovery: { enabled: false },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_SINGLE
                }
            });
            
            console.log('✓ Gateway connected');
        } catch (error) {
            console.error('Failed to connect gateway:', error);
            throw error;
        }
    }

    async connectToChannel(channelName) {
        try {
            // Return cached network if already connected to this channel
            if (this.networks[channelName]) {
                return this.networks[channelName];
            }

            // Get network from gateway (gateway already connected in initialize())
            const network = await this.gateway.getNetwork(channelName);
            this.networks[channelName] = network;
            console.log(`✓ Connected to channel: ${channelName}`);
            
            return network;
        } catch (error) {
            console.error(`Failed to get network for channel ${channelName}:`, error);
            throw error;
        }
    }

    async getContract(channelName, contractName) {
        const network = await this.connectToChannel(channelName);
        return network.getContract(contractName);
    }

    async disconnect() {
        if (this.gateway) {
            this.gateway.disconnect();
            console.log('✓ Disconnected from gateway');
        }
    }
}

module.exports = new FabricClient();
