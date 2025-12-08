/*
 * Fabric Network Configuration
 * Helper functions to connect to the Hyperledger Fabric network
 */

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class FabricGateway {
    constructor() {
        this.gateway = null;
        this.wallet = null;
        this.connectionProfile = null;
    }

    /**
     * Load connection profile from file
     */
    async loadConnectionProfile(orgName = 'traffic') {
        try {
            const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection-profiles', `connection-${orgName}.json`);
            
            if (!fs.existsSync(ccpPath)) {
                throw new Error(`Connection profile not found at ${ccpPath}`);
            }
            
            const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
            this.connectionProfile = JSON.parse(ccpJSON);
            
            logger.info(`Connection profile loaded for ${orgName}`);
            return this.connectionProfile;
        } catch (error) {
            logger.error(`Failed to load connection profile: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create or get wallet
     */
    async getWallet() {
        try {
            if (this.wallet) {
                return this.wallet;
            }

            const walletPath = path.join(process.cwd(), 'wallet');
            this.wallet = await Wallets.newFileSystemWallet(walletPath);
            
            logger.info(`Wallet created/loaded at ${walletPath}`);
            return this.wallet;
        } catch (error) {
            logger.error(`Failed to create wallet: ${error.message}`);
            throw error;
        }
    }

    /**
     * Enroll admin user
     */
    async enrollAdmin(orgName = 'TrafficMSP', caName = 'ca.traffic.example.com') {
        try {
            const wallet = await this.getWallet();

            // Check if admin already enrolled
            const adminExists = await wallet.get('admin');
            if (adminExists) {
                logger.info('Admin user already enrolled');
                return;
            }

            // Load connection profile
            if (!this.connectionProfile) {
                await this.loadConnectionProfile(orgName.toLowerCase().replace('msp', ''));
            }

            // Create CA client
            const caInfo = this.connectionProfile.certificateAuthorities[caName];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Enroll admin
            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: orgName,
                type: 'X.509',
            };
            
            await wallet.put('admin', x509Identity);
            logger.info('Admin user enrolled successfully');
        } catch (error) {
            logger.error(`Failed to enroll admin: ${error.message}`);
            throw error;
        }
    }

    /**
     * Register and enroll user
     */
    async enrollUser(userName, orgName = 'TrafficMSP', caName = 'ca.traffic.example.com') {
        try {
            const wallet = await this.getWallet();

            // Check if user already enrolled
            const userExists = await wallet.get(userName);
            if (userExists) {
                logger.info(`User ${userName} already enrolled`);
                return;
            }

            // Check if admin enrolled
            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                throw new Error('Admin user not enrolled. Enroll admin first.');
            }

            // Load connection profile
            if (!this.connectionProfile) {
                await this.loadConnectionProfile(orgName.toLowerCase().replace('msp', ''));
            }

            // Create CA client
            const caInfo = this.connectionProfile.certificateAuthorities[caName];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Build user object for authenticating with the CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            // Register user
            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: userName,
                role: 'client'
            }, adminUser);

            // Enroll user
            const enrollment = await ca.enroll({
                enrollmentID: userName,
                enrollmentSecret: secret
            });

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: orgName,
                type: 'X.509',
            };

            await wallet.put(userName, x509Identity);
            logger.info(`User ${userName} enrolled successfully`);
        } catch (error) {
            logger.error(`Failed to enroll user ${userName}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Connect to gateway
     */
    async connect(userName = 'User1', orgName = 'traffic') {
        try {
            const wallet = await this.getWallet();
            
            // Check if user exists
            const userIdentity = await wallet.get(userName);
            if (!userIdentity) {
                throw new Error(`User ${userName} not enrolled. Enroll user first.`);
            }

            // Load connection profile
            if (!this.connectionProfile) {
                await this.loadConnectionProfile(orgName);
            }

            // Create gateway instance
            this.gateway = new Gateway();
            
            await this.gateway.connect(this.connectionProfile, {
                wallet,
                identity: userName,
                discovery: { enabled: true, asLocalhost: true }
            });

            logger.info(`Connected to gateway as ${userName}`);
            return this.gateway;
        } catch (error) {
            logger.error(`Failed to connect to gateway: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get network (channel)
     */
    async getNetwork(channelName = 'traffic-channel') {
        try {
            if (!this.gateway) {
                throw new Error('Gateway not connected');
            }

            const network = await this.gateway.getNetwork(channelName);
            logger.info(`Connected to channel: ${channelName}`);
            return network;
        } catch (error) {
            logger.error(`Failed to get network: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get contract (chaincode)
     */
    async getContract(channelName = 'traffic-channel', chaincodeName = 'traffic-contract') {
        try {
            const network = await this.getNetwork(channelName);
            const contract = network.getContract(chaincodeName);
            logger.info(`Got contract: ${chaincodeName}`);
            return contract;
        } catch (error) {
            logger.error(`Failed to get contract: ${error.message}`);
            throw error;
        }
    }

    /**
     * Disconnect from gateway
     */
    async disconnect() {
        try {
            if (this.gateway) {
                await this.gateway.disconnect();
                this.gateway = null;
                logger.info('Disconnected from gateway');
            }
        } catch (error) {
            logger.error(`Failed to disconnect: ${error.message}`);
            throw error;
        }
    }

    /**
     * Listen for contract events
     */
    async listenForEvents(channelName, chaincodeName, eventName, callback) {
        try {
            const network = await this.getNetwork(channelName);
            
            const listener = await network.addBlockListener(
                async (event) => {
                    if (event.blockData && event.blockData.data) {
                        callback(event);
                    }
                },
                {
                    type: 'full'
                }
            );

            logger.info(`Listening for events on ${chaincodeName}`);
            return listener;
        } catch (error) {
            logger.error(`Failed to listen for events: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new FabricGateway();
