#!/bin/bash
#
# generate-genesis.sh - Generate genesis block and channel configuration transactions
#

set -e

# Get the directory where this script is located
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_DIR"

# Set environment variables
export PATH=$PATH:~/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=${PROJECT_DIR}

echo "======================================"
echo "Generating Channel Artifacts"
echo "======================================"

# Create channel-artifacts directory
if [ ! -d "channel-artifacts" ]; then
    mkdir channel-artifacts
fi

# Generate genesis block for orderer
echo "Generating genesis block..."
configtxgen -profile TrafficOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

if [ "$?" -ne 0 ]; then
    echo "Failed to generate genesis block"
    exit 1
fi

# Generate channel configuration transaction for traffic-channel
echo "Generating channel configuration transaction for traffic-channel..."
configtxgen -profile TrafficChannel -outputCreateChannelTx ./channel-artifacts/traffic-channel.tx -channelID traffic-channel

if [ "$?" -ne 0 ]; then
    echo "Failed to generate traffic-channel.tx"
    exit 1
fi

# Generate anchor peer update for TrafficOrg on traffic-channel
echo "Generating anchor peer update for TrafficOrg..."
configtxgen -profile TrafficChannel -outputAnchorPeersUpdate ./channel-artifacts/TrafficMSPanchors-traffic.tx -channelID traffic-channel -asOrg TrafficMSP

# Generate anchor peer update for CityHallOrg on traffic-channel
echo "Generating anchor peer update for CityHallOrg..."
configtxgen -profile TrafficChannel -outputAnchorPeersUpdate ./channel-artifacts/CityHallMSPanchors-traffic.tx -channelID traffic-channel -asOrg CityHallMSP

# Generate anchor peer update for PoliceOrg on traffic-channel
echo "Generating anchor peer update for PoliceOrg..."
configtxgen -profile TrafficChannel -outputAnchorPeersUpdate ./channel-artifacts/PoliceMSPanchors-traffic.tx -channelID traffic-channel -asOrg PoliceMSP

# Generate anchor peer update for EmergencyOrg on traffic-channel
echo "Generating anchor peer update for EmergencyOrg..."
configtxgen -profile TrafficChannel -outputAnchorPeersUpdate ./channel-artifacts/EmergencyMSPanchors-traffic.tx -channelID traffic-channel -asOrg EmergencyMSP

# Generate channel configuration transaction for admin-channel
echo "Generating channel configuration transaction for admin-channel..."
configtxgen -profile AdminChannel -outputCreateChannelTx ./channel-artifacts/admin-channel.tx -channelID admin-channel

if [ "$?" -ne 0 ]; then
    echo "Failed to generate admin-channel.tx"
    exit 1
fi

# Generate anchor peer update for TrafficOrg on admin-channel
echo "Generating anchor peer update for TrafficOrg on admin-channel..."
configtxgen -profile AdminChannel -outputAnchorPeersUpdate ./channel-artifacts/TrafficMSPanchors-admin.tx -channelID admin-channel -asOrg TrafficMSP

# Generate anchor peer update for CityHallOrg on admin-channel
echo "Generating anchor peer update for CityHallOrg on admin-channel..."
configtxgen -profile AdminChannel -outputAnchorPeersUpdate ./channel-artifacts/CityHallMSPanchors-admin.tx -channelID admin-channel -asOrg CityHallMSP

# Generate anchor peer update for PoliceOrg on admin-channel
echo "Generating anchor peer update for PoliceOrg on admin-channel..."
configtxgen -profile AdminChannel -outputAnchorPeersUpdate ./channel-artifacts/PoliceMSPanchors-admin.tx -channelID admin-channel -asOrg PoliceMSP

echo ""
echo "======================================"
echo "Channel artifacts generated successfully!"
echo "======================================"
echo ""
echo "Generated artifacts:"
echo "  - genesis.block (Orderer genesis block)"
echo "  - traffic-channel.tx (Traffic channel config)"
echo "  - admin-channel.tx (Admin channel config)"
echo "  - Anchor peer updates for all organizations"
echo ""
