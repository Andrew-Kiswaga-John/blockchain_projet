#!/bin/bash
#
# ==============================================================================
# Traffic Core Network Management Script
# ==============================================================================
# This script provides commands to:
# - Start/stop the network
# - Generate crypto materials
# - Create channels
# - Deploy chaincode
# - Clean up artifacts
# ==============================================================================

# Exit on first error
set -e

# Add Fabric binaries to PATH
export PATH=$PATH:$HOME/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=$HOME/hyperledger-fabric/fabric-samples/config

# Project paths
export PROJECT_PATH="${PWD}/../.."
export NETWORK_PATH="${PWD}/.."
export FABRIC_CFG_PATH="${NETWORK_PATH}/configtx"
export CHANNEL_ARTIFACTS="${NETWORK_PATH}/channel-artifacts"
export GENESIS_BLOCK_PATH="${NETWORK_PATH}/system-genesis-block"

# Color codes for output
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export NC='\033[0m' # No Color

# Print colored messages
function printMessage() {
    echo -e "${GREEN}>>> $1${NC}"
}

function printError() {
    echo -e "${RED}ERROR: $1${NC}"
}

function printWarning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

function printInfo() {
    echo -e "${BLUE}INFO: $1${NC}"
}

# ==============================================================================
# NETWORK FUNCTIONS
# ==============================================================================

# Generate crypto materials using cryptogen
function generateCrypto() {
    printMessage "Generating crypto materials for all organizations..."
    
    cd "${NETWORK_PATH}/organizations"
    
    if [ -d "ordererOrganizations" ]; then
        printWarning "Crypto materials already exist. Removing old materials..."
        rm -rf ordererOrganizations
        rm -rf peerOrganizations
    fi
    
    # Generate crypto materials
    cryptogen generate --config=./cryptogen/crypto-config.yaml --output="."
    
    if [ $? -ne 0 ]; then
        printError "Failed to generate crypto materials"
        exit 1
    fi
    
    printMessage "Crypto materials generated successfully!"
}

# Generate genesis block and channel transactions
function generateChannelArtifacts() {
    printMessage "Generating genesis block and channel configuration transactions..."
    
    # Create directories if they don't exist
    mkdir -p "${GENESIS_BLOCK_PATH}"
    mkdir -p "${CHANNEL_ARTIFACTS}"
    
    # Generate genesis block for orderer
    printInfo "Generating genesis block..."
    configtxgen -profile TrafficCoreOrdererGenesis \
        -channelID system-channel \
        -outputBlock "${GENESIS_BLOCK_PATH}/genesis.block"
    
    if [ $? -ne 0 ]; then
        printError "Failed to generate genesis block"
        exit 1
    fi
    
    # Generate channel configuration for city-traffic-global
    printInfo "Generating city-traffic-global channel configuration..."
    configtxgen -profile CityTrafficGlobalChannel \
        -channelID city-traffic-global \
        -outputCreateChannelTx "${CHANNEL_ARTIFACTS}/city-traffic-global.tx"
    
    if [ $? -ne 0 ]; then
        printError "Failed to generate city-traffic-global channel transaction"
        exit 1
    fi
    
    # Generate channel configuration for emergency-ops
    printInfo "Generating emergency-ops configuration..."
    configtxgen -profile EmergencyOpsChannel \
        -channelID emergency-ops \
        -outputCreateChannelTx "${CHANNEL_ARTIFACTS}/emergency-ops.tx"
    
    if [ $? -ne 0 ]; then
        printError "Failed to generate emergency-ops transaction"
        exit 1
    fi
    
    # Generate anchor peer updates for city-traffic-global
    printInfo "Generating anchor peer updates for city-traffic-global..."
    
    for org in TrafficAuthority VehicleOperator InfrastructureOperator EmergencyServices ParkingManagement; do
        configtxgen -profile CityTrafficGlobalChannel \
            -channelID city-traffic-global \
            -outputAnchorPeersUpdate "${CHANNEL_ARTIFACTS}/${org}MSPanchors-city-traffic-global.tx" \
            -asOrg ${org}MSP
    done
    
    # Generate anchor peer updates for emergency-ops
    printInfo "Generating anchor peer updates for emergency-ops..."
    
    for org in EmergencyServices TrafficAuthority InfrastructureOperator; do
        configtxgen -profile EmergencyOpsChannel \
            -channelID emergency-ops \
            -outputAnchorPeersUpdate "${CHANNEL_ARTIFACTS}/${org}MSPanchors-emergency-ops.tx" \
            -asOrg ${org}MSP
    done
    
    printMessage "Channel artifacts generated successfully!"
}

# Start the network
function networkUp() {
    printMessage "Starting Traffic Core network..."
    
    # Check if crypto materials exist
    if [ ! -d "${NETWORK_PATH}/organizations/ordererOrganizations" ]; then
        printInfo "Crypto materials not found. Generating..."
        generateCrypto
    fi
    
    # Check if genesis block exists
    if [ ! -f "${GENESIS_BLOCK_PATH}/genesis.block" ]; then
        printInfo "Genesis block not found. Generating channel artifacts..."
        generateChannelArtifacts
    fi
    
    # Start Certificate Authorities
    printInfo "Starting Certificate Authorities..."
    cd "${NETWORK_PATH}/docker"
    docker-compose -f docker-compose-ca.yaml up -d
    sleep 3
    
    # Start Orderers
    printInfo "Starting Orderer nodes..."
    docker-compose -f docker-compose-orderer.yaml up -d
    sleep 5
    
    # Start Peers
    printInfo "Starting Peer nodes..."
    docker-compose -f docker-compose-peers.yaml up -d
    sleep 5
    
    # List running containers
    printInfo "Active containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    printMessage "Network started successfully!"
    printInfo "You can now create channels using: ./network.sh createChannel"
}

# Stop the network
function networkDown() {
    printMessage "Stopping Traffic Core network..."
    
    cd "${NETWORK_PATH}/docker"
    
    # Stop all containers
    docker-compose -f docker-compose-peers.yaml down --volumes --remove-orphans
    docker-compose -f docker-compose-orderer.yaml down --volumes --remove-orphans
    docker-compose -f docker-compose-ca.yaml down --volumes --remove-orphans
    
    # Remove chaincode containers and images
    printInfo "Removing chaincode containers and images..."
    docker rm -f $(docker ps -aq --filter "name=dev-peer") 2>/dev/null || true
    docker rmi -f $(docker images -q "dev-peer*") 2>/dev/null || true
    
    # Prune volumes
    docker volume prune -f
    
    printMessage "Network stopped successfully!"
}

# Clean all artifacts
function networkClean() {
    printMessage "Cleaning all network artifacts..."
    
    # Stop network first
    networkDown
    
    # Remove crypto materials
    printInfo "Removing crypto materials..."
    rm -rf "${NETWORK_PATH}/organizations/ordererOrganizations"
    rm -rf "${NETWORK_PATH}/organizations/peerOrganizations"
    rm -rf "${NETWORK_PATH}/organizations/fabric-ca"
    
    # Remove channel artifacts
    printInfo "Removing channel artifacts..."
    rm -rf "${CHANNEL_ARTIFACTS}"/*
    rm -rf "${GENESIS_BLOCK_PATH}"/*
    
    # Remove application wallets
    printInfo "Removing application wallets..."
    rm -rf "${PROJECT_PATH}/application/backend/wallet"
    
    printMessage "Network cleaned successfully!"
}

# Create channels
function createChannels() {
    printMessage "Creating channels..."
    
    # Source environment variables
    source "${NETWORK_PATH}/scripts/envVars.sh"
    
    # Create city-traffic-global channel
    printInfo "Creating city-traffic-global channel..."
    setGlobals TrafficAuthority 0
    
    peer channel create \
        -o orderer0.example.com:7050 \
        -c city-traffic-global \
        -f "${CHANNEL_ARTIFACTS}/city-traffic-global.tx" \
        --outputBlock "${CHANNEL_ARTIFACTS}/city-traffic-global.block" \
        --tls --cafile "${ORDERER_CA}"
    
    if [ $? -ne 0 ]; then
        printError "Failed to create city-traffic-global channel"
        exit 1
    fi
    
    sleep 2
    
    # Create emergency-ops
    printInfo "Creating emergency-ops..."
    
    peer channel create \
        -o orderer0.example.com:7050 \
        -c emergency-ops \
        -f "${CHANNEL_ARTIFACTS}/emergency-ops.tx" \
        --outputBlock "${CHANNEL_ARTIFACTS}/emergency-ops.block" \
        --tls --cafile "${ORDERER_CA}"
    
    if [ $? -ne 0 ]; then
        printError "Failed to create emergency-ops"
        exit 1
    fi
    
    printMessage "Channels created successfully!"
    printInfo "You can now join peers to channels using: ./network.sh joinChannel"
}

# Join peers to channels
function joinChannel() {
    printMessage "Joining peers to channels..."
    
    source "${NETWORK_PATH}/scripts/envVars.sh"
    
    # Join city-traffic-global channel - all 5 organizations
    printInfo "Joining peers to city-traffic-global channel..."
    
    for org in TrafficAuthority VehicleOperator InfrastructureOperator EmergencyServices ParkingManagement; do
        for peer in 0 1; do
            setGlobals ${org} ${peer}
            peer channel join -b "${CHANNEL_ARTIFACTS}/city-traffic-global.block"
            sleep 1
        done
    done
    
    # Join emergency-ops - 3 organizations
    printInfo "Joining peers to emergency-ops..."
    
    for org in EmergencyServices TrafficAuthority InfrastructureOperator; do
        for peer in 0 1; do
            setGlobals ${org} ${peer}
            peer channel join -b "${CHANNEL_ARTIFACTS}/emergency-ops.block"
            sleep 1
        done
    done
    
    printMessage "Peers joined to channels successfully!"
    printInfo "You can now update anchor peers using: ./network.sh updateAnchorPeers"
}

# Update anchor peers
function updateAnchorPeers() {
    printMessage "Updating anchor peers..."
    
    source "${NETWORK_PATH}/scripts/envVars.sh"
    
    # Update anchor peers for city-traffic-global
    printInfo "Updating anchor peers for city-traffic-global..."
    
    for org in TrafficAuthority VehicleOperator InfrastructureOperator EmergencyServices ParkingManagement; do
        setGlobals ${org} 0
        peer channel update \
            -o orderer0.example.com:7050 \
            -c city-traffic-global \
            -f "${CHANNEL_ARTIFACTS}/${org}MSPanchors-city-traffic-global.tx" \
            --tls --cafile "${ORDERER_CA}"
        sleep 1
    done
    
    # Update anchor peers for emergency-ops
    printInfo "Updating anchor peers for emergency-ops..."
    
    for org in EmergencyServices TrafficAuthority InfrastructureOperator; do
        setGlobals ${org} 0
        peer channel update \
            -o orderer0.example.com:7050 \
            -c emergency-ops \
            -f "${CHANNEL_ARTIFACTS}/${org}MSPanchors-emergency-ops.tx" \
            --tls --cafile "${ORDERER_CA}"
        sleep 1
    done
    
    printMessage "Anchor peers updated successfully!"
}

# Deploy chaincode (placeholder - will be implemented in Phase 3)
function deployChaincode() {
    printWarning "Chaincode deployment will be implemented in Phase 3"
    printInfo "This function will deploy traffic-contract and emergency-contract"
}

# ==============================================================================
# MAIN SCRIPT
# ==============================================================================

# Print usage
function printHelp() {
    echo ""
    echo "Usage: ./network.sh <command>"
    echo ""
    echo "Commands:"
    echo "  up                - Start the network"
    echo "  down              - Stop the network"
    echo "  clean             - Clean all artifacts and stop network"
    echo "  restart           - Restart the network"
    echo "  generateCrypto    - Generate crypto materials"
    echo "  generateArtifacts - Generate channel artifacts"
    echo "  createChannel     - Create both channels"
    echo "  joinChannel       - Join peers to channels"
    echo "  updateAnchorPeers - Update anchor peers for channels"
    echo "  deployCC          - Deploy chaincode (Phase 3)"
    echo ""
    echo "Examples:"
    echo "  ./network.sh up                    # Start network"
    echo "  ./network.sh createChannel         # Create channels"
    echo "  ./network.sh down                  # Stop network"
    echo ""
}

# Parse command
case "$1" in
    up)
        networkUp
        ;;
    down)
        networkDown
        ;;
    clean)
        networkClean
        ;;
    restart)
        networkDown
        networkUp
        ;;
    generateCrypto)
        generateCrypto
        ;;
    generateArtifacts)
        generateChannelArtifacts
        ;;
    createChannel)
        createChannels
        ;;
    joinChannel)
        joinChannel
        ;;
    updateAnchorPeers)
        updateAnchorPeers
        ;;
    deployCC)
        deployChaincode
        ;;
    *)
        printHelp
        exit 1
        ;;
esac
