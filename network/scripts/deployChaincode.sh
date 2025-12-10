#!/bin/bash

# Deploy Chaincode Script for Traffic Core Network
# This script packages, installs, approves, and commits chaincode to channels

set -e

# Source environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "${SCRIPT_DIR}/envVars.sh"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
CHANNEL_NAME=""
CC_NAME=""
CC_SRC_PATH=""
CC_VERSION="1.0"
CC_SEQUENCE="1"
INIT_REQUIRED="false"
CC_END_POLICY="NA"
CC_COLL_CONFIG="NA"
DELAY="3"
MAX_RETRY="5"
VERBOSE="false"

printHelp() {
    echo "Usage: "
    echo "  deployChaincode.sh <command>"
    echo ""
    echo "Commands:"
    echo "  package      - Package chaincode"
    echo "  install      - Install chaincode on all peers"
    echo "  approve      - Approve chaincode for organizations"
    echo "  commit       - Commit chaincode to channel"
    echo "  deployAll    - Run all steps (package, install, approve, commit)"
    echo ""
    echo "Flags:"
    echo "  -n <chaincode-name>     - Chaincode name"
    echo "  -c <channel-name>       - Channel name"
    echo "  -p <path>               - Path to chaincode"
    echo "  -v <version>            - Chaincode version (default: 1.0)"
    echo "  -s <sequence>           - Chaincode sequence (default: 1)"
    echo "  -i                      - Init required (default: false)"
    echo "  -h                      - Print help"
}

packageChaincode() {
    echo -e "${GREEN}>>> Packaging chaincode: ${CC_NAME}${NC}"
    
    CC_LABEL="${CC_NAME}_${CC_VERSION}"
    
    # Create chaincode package
    peer lifecycle chaincode package ${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH} \
        --lang node \
        --label ${CC_LABEL}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Chaincode packaged successfully: ${CC_NAME}.tar.gz${NC}"
    else
        echo -e "${RED}✗ Failed to package chaincode${NC}"
        exit 1
    fi
}

installChaincode() {
    echo -e "${GREEN}>>> Installing chaincode on all peers${NC}"
    
    # Install on TrafficAuthority peers
    setGlobals TrafficAuthority 0
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    setGlobals TrafficAuthority 1
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    
    # Install on VehicleOperator peers (if city-traffic-global channel)
    if [ "$CHANNEL_NAME" = "city-traffic-global" ]; then
        setGlobals VehicleOperator 0
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
        setGlobals VehicleOperator 1
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    fi
    
    # Install on InfrastructureOperator peers
    setGlobals InfrastructureOperator 0
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    setGlobals InfrastructureOperator 1
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    
    # Install on EmergencyServices peers
    setGlobals EmergencyServices 0
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    setGlobals EmergencyServices 1
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    
    # Install on Parking peers (if city-traffic-global channel)
    if [ "$CHANNEL_NAME" = "city-traffic-global" ]; then
        setGlobals ParkingManagement 0
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
        setGlobals ParkingManagement 1
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    fi
    
    echo -e "${GREEN}✓ Chaincode installed on all peers${NC}"
}

queryInstalled() {
    setGlobals $1 0
    peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo "Package ID: $PACKAGE_ID"
}

approveForMyOrg() {
    ORG=$1
    echo -e "${GREEN}>>> Approving chaincode for ${ORG}${NC}"
    
    setGlobals $ORG 0
    
    # Query installed to get package ID
    peer lifecycle chaincode queryinstalled >&log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    
    if [ -z "$PACKAGE_ID" ]; then
        echo -e "${RED}✗ Package ID not found. Chaincode may not be installed.${NC}"
        exit 1
    fi
    
    echo "Package ID: $PACKAGE_ID"
    
    # Approve chaincode
    if [ "$INIT_REQUIRED" = "true" ]; then
        peer lifecycle chaincode approveformyorg \
            -o orderer0.example.com:7050 \
            --tls --cafile $ORDERER_CA \
            --channelID $CHANNEL_NAME \
            --name $CC_NAME \
            --version $CC_VERSION \
            --package-id $PACKAGE_ID \
            --sequence $CC_SEQUENCE \
            --init-required
    else
        peer lifecycle chaincode approveformyorg \
            -o orderer0.example.com:7050 \
            --tls --cafile $ORDERER_CA \
            --channelID $CHANNEL_NAME \
            --name $CC_NAME \
            --version $CC_VERSION \
            --package-id $PACKAGE_ID \
            --sequence $CC_SEQUENCE
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Chaincode approved for ${ORG}${NC}"
    else
        echo -e "${RED}✗ Failed to approve chaincode for ${ORG}${NC}"
        exit 1
    fi
}

checkCommitReadiness() {
    echo -e "${GREEN}>>> Checking commit readiness${NC}"
    
    setGlobals TrafficAuthority 0
    peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME \
        --name $CC_NAME \
        --version $CC_VERSION \
        --sequence $CC_SEQUENCE \
        --output json
}

commitChaincodeDefinition() {
    echo -e "${GREEN}>>> Committing chaincode definition${NC}"
    
    setGlobals TrafficAuthority 0
    
    # Build peer connection parameters
    if [ "$CHANNEL_NAME" = "city-traffic-global" ]; then
        # All 5 organizations
        PEER_CONN_PARMS="--peerAddresses peer0.trafficauthority.example.com:7051 --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA"
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.vehicleoperator.example.com:9051 --tlsRootCertFiles $PEER0_VEHICLEOPERATOR_CA"
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.infrastructure.example.com:11051 --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA"
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.emergency.example.com:13051 --tlsRootCertFiles $PEER0_EMERGENCY_CA"
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.parking.example.com:15051 --tlsRootCertFiles $PEER0_PARKING_CA"
    else
        # emergency-channel: 3 organizations
        PEER_CONN_PARMS="--peerAddresses peer0.trafficauthority.example.com:7051 --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA"
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.infrastructure.example.com:11051 --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA"
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.emergency.example.com:13051 --tlsRootCertFiles $PEER0_EMERGENCY_CA"
    fi
    
    # Commit chaincode
    if [ "$INIT_REQUIRED" = "true" ]; then
        peer lifecycle chaincode commit \
            -o orderer0.example.com:7050 \
            --tls --cafile $ORDERER_CA \
            --channelID $CHANNEL_NAME \
            --name $CC_NAME \
            --version $CC_VERSION \
            --sequence $CC_SEQUENCE \
            --init-required \
            $PEER_CONN_PARMS
    else
        peer lifecycle chaincode commit \
            -o orderer0.example.com:7050 \
            --tls --cafile $ORDERER_CA \
            --channelID $CHANNEL_NAME \
            --name $CC_NAME \
            --version $CC_VERSION \
            --sequence $CC_SEQUENCE \
            $PEER_CONN_PARMS
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Chaincode committed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to commit chaincode${NC}"
        exit 1
    fi
}

queryCommitted() {
    echo -e "${GREEN}>>> Querying committed chaincodes${NC}"
    
    setGlobals TrafficAuthority 0
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME
}

initChaincode() {
    echo -e "${GREEN}>>> Initializing chaincode${NC}"
    
    setGlobals TrafficAuthority 0
    
    if [ "$INIT_REQUIRED" = "true" ]; then
        # Build peer connection parameters for init
        if [ "$CHANNEL_NAME" = "city-traffic-global" ]; then
            # All 5 organizations
            PEER_CONN_PARMS="--peerAddresses peer0.trafficauthority.example.com:7051 --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA"
            PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.vehicleoperator.example.com:9051 --tlsRootCertFiles $PEER0_VEHICLEOPERATOR_CA"
            PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.infrastructure.example.com:11051 --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA"
            PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.emergency.example.com:13051 --tlsRootCertFiles $PEER0_EMERGENCY_CA"
            PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.parking.example.com:15051 --tlsRootCertFiles $PEER0_PARKING_CA"
        else
            # emergency-channel: 3 organizations
            PEER_CONN_PARMS="--peerAddresses peer0.trafficauthority.example.com:7051 --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA"
            PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.infrastructure.example.com:11051 --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA"
            PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses peer0.emergency.example.com:13051 --tlsRootCertFiles $PEER0_EMERGENCY_CA"
        fi
        
        peer chaincode invoke \
            -o orderer0.example.com:7050 \
            --tls --cafile $ORDERER_CA \
            -C $CHANNEL_NAME \
            -n $CC_NAME \
            --isInit \
            $PEER_CONN_PARMS \
            -c '{"function":"initLedger","Args":[]}'
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Chaincode initialized successfully${NC}"
        else
            echo -e "${RED}✗ Failed to initialize chaincode${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Init not required for this chaincode${NC}"
    fi
}

deployAll() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deploying Chaincode: ${CC_NAME}${NC}"
    echo -e "${GREEN}Channel: ${CHANNEL_NAME}${NC}"
    echo -e "${GREEN}Version: ${CC_VERSION}${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    packageChaincode
    installChaincode
    
    # Approve for all organizations
    echo -e "${GREEN}>>> Approving for all organizations${NC}"
    approveForMyOrg TrafficAuthority
    
    if [ "$CHANNEL_NAME" = "city-traffic-global" ]; then
        approveForMyOrg VehicleOperator
        approveForMyOrg ParkingManagement
    fi
    
    approveForMyOrg InfrastructureOperator
    approveForMyOrg EmergencyServices
    
    checkCommitReadiness
    commitChaincodeDefinition
    queryCommitted
    
    if [ "$INIT_REQUIRED" = "true" ]; then
        initChaincode
    fi
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Chaincode deployment complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Parse command line arguments
if [ "$1" = "package" ]; then
    COMMAND="package"
elif [ "$1" = "install" ]; then
    COMMAND="install"
elif [ "$1" = "approve" ]; then
    COMMAND="approve"
elif [ "$1" = "commit" ]; then
    COMMAND="commit"
elif [ "$1" = "deployAll" ]; then
    COMMAND="deployAll"
else
    printHelp
    exit 1
fi

shift

# Parse flags
while getopts "n:c:p:v:s:ih" opt; do
    case "$opt" in
        n) CC_NAME=$OPTARG ;;
        c) CHANNEL_NAME=$OPTARG ;;
        p) CC_SRC_PATH=$OPTARG ;;
        v) CC_VERSION=$OPTARG ;;
        s) CC_SEQUENCE=$OPTARG ;;
        i) INIT_REQUIRED="true" ;;
        h)
            printHelp
            exit 0
            ;;
        ?)
            printHelp
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$CC_NAME" ] || [ -z "$CHANNEL_NAME" ]; then
    echo -e "${RED}Error: Chaincode name (-n) and channel name (-c) are required${NC}"
    printHelp
    exit 1
fi

if [ "$COMMAND" = "package" ] && [ -z "$CC_SRC_PATH" ]; then
    echo -e "${RED}Error: Path to chaincode (-p) is required for package command${NC}"
    printHelp
    exit 1
fi

# Execute command
case "$COMMAND" in
    package)
        packageChaincode
        ;;
    install)
        installChaincode
        ;;
    approve)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Organization name required for approve command${NC}"
            exit 1
        fi
        approveForMyOrg $2
        ;;
    commit)
        commitChaincodeDefinition
        ;;
    deployAll)
        deployAll
        ;;
esac
