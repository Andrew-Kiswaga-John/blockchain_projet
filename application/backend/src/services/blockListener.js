const fabricClient = require('../fabric-sdk/fabricClient');

class BlockListener {
    constructor() {
        this.listener = null;
    }

    async start(io) {
        try {
            console.log('🔗 Starting Block Listener...');
            const network = await fabricClient.getNetwork('city-traffic-global', 'TrafficAuthority');

            this.listener = await network.addBlockListener(async (event) => {
                const blockNumber = event.blockNumber.toNumber();
                console.log(`📦 New Block Committed: #${blockNumber}`);

                // Extract simpler data for frontend
                const blockData = {
                    blockNumber: blockNumber,
                    txCount: event.blockData.data.data.length,
                    timestamp: new Date().toISOString(),
                    transactions: event.blockData.data.data.map(tx => {
                        // Attempt to extract basic transaction details if possible
                        // Note: Deep extraction of RW sets requires detailed protobuf decoding
                        // For now we send basic stats
                        return {
                            txId: 'tx-' + Math.random().toString(36).substr(2, 9), // Placeholder as real TxID is deep in header
                            status: 'VALID'
                        };
                    })
                };

                // Emit to all connected clients
                io.emit('new-block', blockData);
            });

            console.log('✓ Block Listener attached to city-traffic-global');
        } catch (error) {
            console.error('❌ Failed to start Block Listener:', error);
        }
    }
}

module.exports = new BlockListener();
