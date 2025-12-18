const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricClient {
    constructor() {
        this.gateway = null;
        this.wallet = null;
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

            console.log('✓ Fabric client initialized');
        } catch (error) {
            console.error('Failed to initialize Fabric client:', error);
            throw error;
        }
    }

    async enrollAdmin() {
        try {
            const orgName = 'trafficauthority';
            const adminCertPath = `${this.networkPath}/organizations/peerOrganizations/${orgName}.example.com/users/Admin@${orgName}.example.com/msp/signcerts/Admin@${orgName}.example.com-cert.pem`;
            const adminKeyDir = `${this.networkPath}/organizations/peerOrganizations/${orgName}.example.com/users/Admin@${orgName}.example.com/msp/keystore`;
            
            const certificate = fs.readFileSync(adminCertPath).toString();
            const keyFiles = fs.readdirSync(adminKeyDir);
            const privateKey = fs.readFileSync(path.join(adminKeyDir, keyFiles[0])).toString();

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

    async connectToChannel(channelName) {
        try {
            this.gateway = new Gateway();
            
            const orgName = 'trafficauthority';
            const peerPath = `${this.networkPath}/organizations/peerOrganizations/${orgName}.example.com`;
            
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
                peers: {
                    'peer0.trafficauthority.example.com': {
                        url: 'grpcs://localhost:7051',
                        tlsCACerts: {
                            pem: fs.readFileSync(`${peerPath}/peers/peer0.${orgName}.example.com/tls/ca.crt`).toString()
                        },
                        grpcOptions: {
                            'ssl-target-name-override': `peer0.${orgName}.example.com`,
                            'hostnameOverride': `peer0.${orgName}.example.com`
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

            await this.gateway.connect(connectionProfile, {
                wallet: this.wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: true }
            });

            const network = await this.gateway.getNetwork(channelName);
            console.log(`✓ Connected to channel: ${channelName}`);
            
            return network;
        } catch (error) {
            console.error('Failed to connect to channel:', error);
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
