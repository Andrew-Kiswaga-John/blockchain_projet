#!/bin/bash
#
# create-channels.sh - Create and join channels
#

set -e

CHANNEL_NAME=$1

if [ -z "$CHANNEL_NAME" ]; then
    echo "Usage: ./create-channels.sh <channel-name>"
    echo "Example: ./create-channels.sh traffic-channel"
    exit 1
fi

# Set environment variables
export PATH=$PATH:~/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=~/hyperledger-fabric/fabric-samples/config
export CORE_PEER_TLS_ENABLED=true

# Store project directory for accessing crypto-config and channel-artifacts
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo "======================================"
echo "Creating Channel: $CHANNEL_NAME"
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

# Create channel (using TrafficOrg as the creator)
echo "Creating channel $CHANNEL_NAME..."
setGlobals traffic 0

peer channel create \
    -o localhost:7050 \
    -c $CHANNEL_NAME \
    -f ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.tx \
    --outputBlock ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block \
    --tls \
    --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

if [ "$?" -ne 0 ]; then
    echo "Failed to create channel"
    exit 1
fi

echo "Channel $CHANNEL_NAME created successfully!"
sleep 2

# Join peers to channel based on channel name
if [ "$CHANNEL_NAME" == "traffic-channel" ]; then
    # All 4 organizations join traffic-channel
    
    # TrafficOrg peers
    echo "Joining TrafficOrg peer0 to $CHANNEL_NAME..."
    setGlobals traffic 0
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    echo "Joining TrafficOrg peer1 to $CHANNEL_NAME..."
    setGlobals traffic 1
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    # CityHallOrg peers
    echo "Joining CityHallOrg peer0 to $CHANNEL_NAME..."
    setGlobals cityhall 0
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    echo "Joining CityHallOrg peer1 to $CHANNEL_NAME..."
    setGlobals cityhall 1
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    # PoliceOrg peers
    echo "Joining PoliceOrg peer0 to $CHANNEL_NAME..."
    setGlobals police 0
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    echo "Joining PoliceOrg peer1 to $CHANNEL_NAME..."
    setGlobals police 1
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    # EmergencyOrg peers
    echo "Joining EmergencyOrg peer0 to $CHANNEL_NAME..."
    setGlobals emergency 0
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    echo "Joining EmergencyOrg peer1 to $CHANNEL_NAME..."
    setGlobals emergency 1
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    # Update anchor peers
    echo "Updating anchor peers for TrafficOrg..."
    setGlobals traffic 0
    peer channel update -o localhost:7050 -c $CHANNEL_NAME -f ${PROJECT_DIR}/channel-artifacts/TrafficMSPanchors-traffic.tx --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    echo "Updating anchor peers for CityHallOrg..."
    setGlobals cityhall 0
    peer channel update -o localhost:7050 -c $CHANNEL_NAME -f ${PROJECT_DIR}/channel-artifacts/CityHallMSPanchors-traffic.tx --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    echo "Updating anchor peers for PoliceOrg..."
    setGlobals police 0
    peer channel update -o localhost:7050 -c $CHANNEL_NAME -f ${PROJECT_DIR}/channel-artifacts/PoliceMSPanchors-traffic.tx --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    echo "Updating anchor peers for EmergencyOrg..."
    setGlobals emergency 0
    peer channel update -o localhost:7050 -c $CHANNEL_NAME -f ${PROJECT_DIR}/channel-artifacts/EmergencyMSPanchors-traffic.tx --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

elif [ "$CHANNEL_NAME" == "admin-channel" ]; then
    # Only 3 organizations join admin-channel (Traffic, CityHall, Police)
    
    # TrafficOrg peers
    echo "Joining TrafficOrg peer0 to $CHANNEL_NAME..."
    setGlobals traffic 0
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    echo "Joining TrafficOrg peer1 to $CHANNEL_NAME..."
    setGlobals traffic 1
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    # CityHallOrg peers
    echo "Joining CityHallOrg peer0 to $CHANNEL_NAME..."
    setGlobals cityhall 0
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    echo "Joining CityHallOrg peer1 to $CHANNEL_NAME..."
    setGlobals cityhall 1
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    # PoliceOrg peers
    echo "Joining PoliceOrg peer0 to $CHANNEL_NAME..."
    setGlobals police 0
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    echo "Joining PoliceOrg peer1 to $CHANNEL_NAME..."
    setGlobals police 1
    peer channel join -b ${PROJECT_DIR}/channel-artifacts/${CHANNEL_NAME}.block
    
    # Update anchor peers
    echo "Updating anchor peers for TrafficOrg..."
    setGlobals traffic 0
    peer channel update -o localhost:7050 -c $CHANNEL_NAME -f ${PROJECT_DIR}/channel-artifacts/TrafficMSPanchors-admin.tx --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    echo "Updating anchor peers for CityHallOrg..."
    setGlobals cityhall 0
    peer channel update -o localhost:7050 -c $CHANNEL_NAME -f ${PROJECT_DIR}/channel-artifacts/CityHallMSPanchors-admin.tx --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    echo "Updating anchor peers for PoliceOrg..."
    setGlobals police 0
    peer channel update -o localhost:7050 -c $CHANNEL_NAME -f ${PROJECT_DIR}/channel-artifacts/PoliceMSPanchors-admin.tx --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
fi

echo ""
echo "======================================"
echo "Channel $CHANNEL_NAME Setup Complete!"
echo "======================================"
echo ""
