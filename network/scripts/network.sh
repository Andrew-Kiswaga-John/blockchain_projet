#!/bin/bash
#
# network.sh - Master control script for network operations
#

function printHelp() {
    echo "Usage: "
    echo "  network.sh <mode> [options]"
    echo "    <mode> - one of 'up', 'down', 'restart', 'generate', 'createChannel', 'deployCC'"
    echo ""
    echo "  network.sh up - Start the network"
    echo "  network.sh down - Stop the network"
    echo "  network.sh restart - Restart the network"
    echo "  network.sh generate - Generate crypto materials and channel artifacts"
    echo "  network.sh createChannel -c <channel-name> - Create and join a channel"
    echo "  network.sh deployCC -n <name> -v <version> -c <channel> - Deploy chaincode"
    echo ""
    echo "Examples:"
    echo "  network.sh up"
    echo "  network.sh createChannel -c traffic-channel"
    echo "  network.sh deployCC -n traffic-contract -v 1.0 -c traffic-channel"
}

function networkUp() {
    echo "Starting network..."
    ./scripts/start-network.sh
}

function networkDown() {
    echo "Stopping network..."
    ./scripts/stop-network.sh
}

function generateArtifacts() {
    echo "Generating crypto materials and channel artifacts..."
    ./scripts/generate-crypto.sh
    ./scripts/generate-genesis.sh
}

function createChannel() {
    if [ -z "$CHANNEL_NAME" ]; then
        echo "Error: Channel name not specified"
        exit 1
    fi
    echo "Creating channel: $CHANNEL_NAME"
    ./scripts/create-channels.sh $CHANNEL_NAME
}

function deployChaincode() {
    if [ -z "$CC_NAME" ] || [ -z "$CC_VERSION" ]; then
        echo "Error: Chaincode name and version must be specified"
        exit 1
    fi
    
    CHANNEL_NAME=${CHANNEL_NAME:-traffic-channel}
    echo "Deploying chaincode: $CC_NAME version $CC_VERSION on channel $CHANNEL_NAME"
    ./scripts/deploy-chaincode.sh $CC_NAME $CC_VERSION $CHANNEL_NAME
}

# Parse commandline args
MODE=$1
shift

# Parse flags
while [[ $# -ge 1 ]] ; do
    key="$1"
    case $key in
        -c )
            CHANNEL_NAME="$2"
            shift
            ;;
        -n )
            CC_NAME="$2"
            shift
            ;;
        -v )
            CC_VERSION="$2"
            shift
            ;;
        -h )
            printHelp
            exit 0
            ;;
        * )
            echo "Unknown flag: $key"
            printHelp
            exit 1
            ;;
    esac
    shift
done

# Determine mode
if [ "$MODE" == "up" ]; then
    networkUp
elif [ "$MODE" == "down" ]; then
    networkDown
elif [ "$MODE" == "restart" ]; then
    networkDown
    networkUp
elif [ "$MODE" == "generate" ]; then
    generateArtifacts
elif [ "$MODE" == "createChannel" ]; then
    createChannel
elif [ "$MODE" == "deployCC" ]; then
    deployChaincode
else
    printHelp
    exit 1
fi
