#!/bin/bash
#
# deploy-chaincode.sh - Package, install, approve, and commit chaincode
#

set -e

CHAINCODE_NAME=$1
CHAINCODE_VERSION=$2
CHANNEL_NAME=${3:-traffic-channel}
SEQUENCE=${4:-1}

# Set environment variables first
export PATH=$PATH:~/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=~/hyperledger-fabric/fabric-samples/config
export CORE_PEER_TLS_ENABLED=true

# Store project directory
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
CHAINCODE_PATH="${PROJECT_DIR}/../chaincode/${CHAINCODE_NAME}"

if [ -z "$CHAINCODE_NAME" ] || [ -z "$CHAINCODE_VERSION" ]; then
    echo "Usage: ./deploy-chaincode.sh <chaincode-name> <version> [channel-name] [sequence]"
    echo "Example: ./deploy-chaincode.sh traffic-contract 1.0 traffic-channel 1"
    exit 1
fi

echo "======================================"
echo "Deploying Chaincode: $CHAINCODE_NAME"
echo "Version: $CHAINCODE_VERSION"
echo "Channel: $CHANNEL_NAME"
echo "Sequence: $SEQUENCE"
echo "======================================"

# Function to set environment for a peer
setGlobals() {
    local ORG=$1
    local PEER=$2
    
    if [ "$ORG" == "traffic" ]; then
        export CORE_PEER_LOCALMSPID="TrafficMSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer${PEER}.traffic.example.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/users/Admin@traffic.example.com/msp
        if [ "$PEER" == "0" ]; then
            export CORE_PEER_ADDRESS=localhost:7051
        else
            export CORE_PEER_ADDRESS=localhost:7061
        fi
    elif [ "$ORG" == "cityhall" ]; then
        export CORE_PEER_LOCALMSPID="CityHallMSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer${PEER}.cityhall.example.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/users/Admin@cityhall.example.com/msp
        if [ "$PEER" == "0" ]; then
            export CORE_PEER_ADDRESS=localhost:8051
        else
            export CORE_PEER_ADDRESS=localhost:8061
        fi
    elif [ "$ORG" == "police" ]; then
        export CORE_PEER_LOCALMSPID="PoliceMSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer${PEER}.police.example.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/users/Admin@police.example.com/msp
        if [ "$PEER" == "0" ]; then
            export CORE_PEER_ADDRESS=localhost:9051
        else
            export CORE_PEER_ADDRESS=localhost:9061
        fi
    elif [ "$ORG" == "emergency" ]; then
        export CORE_PEER_LOCALMSPID="EmergencyMSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/emergency.example.com/peers/peer${PEER}.emergency.example.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/emergency.example.com/users/Admin@emergency.example.com/msp
        if [ "$PEER" == "0" ]; then
            export CORE_PEER_ADDRESS=localhost:10051
        else
            export CORE_PEER_ADDRESS=localhost:10061
        fi
    fi
}

# Package chaincode
echo "Packaging chaincode..."
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz \
    --path ${CHAINCODE_PATH} \
    --lang node \
    --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}

if [ "$?" -ne 0 ]; then
    echo "Failed to package chaincode"
    exit 1
fi

# Install chaincode on all peers based on channel membership
if [ "$CHANNEL_NAME" == "traffic-channel" ]; then
    ORGS=("traffic" "cityhall" "police" "emergency")
elif [ "$CHANNEL_NAME" == "admin-channel" ]; then
    ORGS=("traffic" "cityhall" "police")
fi

for ORG in "${ORGS[@]}"; do
    echo "Installing chaincode on ${ORG} peer0..."
    setGlobals $ORG 0
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
    
    echo "Installing chaincode on ${ORG} peer1..."
    setGlobals $ORG 1
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
done

# Get package ID
echo "Querying installed chaincode..."
setGlobals traffic 0
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep ${CHAINCODE_NAME}_${CHAINCODE_VERSION} | awk '{print $3}' | sed 's/,$//')

if [ -z "$PACKAGE_ID" ]; then
    echo "Failed to get package ID"
    exit 1
fi

echo "Package ID: $PACKAGE_ID"

# Approve chaincode for each organization
for ORG in "${ORGS[@]}"; do
    echo "Approving chaincode for ${ORG}..."
    setGlobals $ORG 0
    
    peer lifecycle chaincode approveformyorg \
        -o localhost:7050 \
        --ordererTLSHostnameOverride orderer0.example.com \
        --channelID $CHANNEL_NAME \
        --name $CHAINCODE_NAME \
        --version $CHAINCODE_VERSION \
        --package-id $PACKAGE_ID \
        --sequence $SEQUENCE \
        --tls \
        --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ "$?" -ne 0 ]; then
        echo "Failed to approve chaincode for ${ORG}"
        exit 1
    fi
done

# Check commit readiness
echo "Checking commit readiness..."
setGlobals traffic 0
peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --sequence $SEQUENCE \
    --tls \
    --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --output json

# Commit chaincode definition
echo "Committing chaincode definition..."
setGlobals traffic 0

# Build peer address arguments
PEER_CONN_PARMS=""
for ORG in "${ORGS[@]}"; do
    if [ "$ORG" == "traffic" ]; then
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses localhost:7051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt"
    elif [ "$ORG" == "cityhall" ]; then
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses localhost:8051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer0.cityhall.example.com/tls/ca.crt"
    elif [ "$ORG" == "police" ]; then
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses localhost:9051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer0.police.example.com/tls/ca.crt"
    elif [ "$ORG" == "emergency" ]; then
        PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses localhost:10051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt"
    fi
done

peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --sequence $SEQUENCE \
    --tls \
    --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    $PEER_CONN_PARMS

if [ "$?" -ne 0 ]; then
    echo "Failed to commit chaincode"
    exit 1
fi

# Query committed chaincode
echo "Querying committed chaincode..."
peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name $CHAINCODE_NAME

# Initialize ledger (optional)
echo "Initializing ledger..."
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --tls \
    --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    $PEER_CONN_PARMS \
    -c '{"function":"initLedger","Args":[]}'

echo ""
echo "======================================"
echo "Chaincode Deployed Successfully!"
echo "======================================"
echo ""
echo "Chaincode: $CHAINCODE_NAME"
echo "Version: $CHAINCODE_VERSION"
echo "Channel: $CHANNEL_NAME"
echo "Package ID: $PACKAGE_ID"
echo ""
