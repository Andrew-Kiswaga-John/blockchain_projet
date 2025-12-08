#!/bin/bash
#
# test-network.sh - Network validation and testing script
#

set -e

export PATH=$PATH:~/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=${PWD}
export CORE_PEER_TLS_ENABLED=true

echo "======================================"
echo "Testing Network Components"
echo "======================================"

# Function to set environment for TrafficOrg peer0
setTrafficPeer() {
    export CORE_PEER_LOCALMSPID="TrafficMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/traffic.example.com/users/Admin@traffic.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

# Test 1: Check if all containers are running
echo "Test 1: Checking Docker containers..."
EXPECTED_CONTAINERS=16  # 3 orderers + 8 peers + 5 CAs
RUNNING_CONTAINERS=$(docker ps | grep -E "peer|orderer|ca\." | wc -l)

echo "Expected containers: $EXPECTED_CONTAINERS"
echo "Running containers: $RUNNING_CONTAINERS"

if [ $RUNNING_CONTAINERS -eq $EXPECTED_CONTAINERS ]; then
    echo "✓ All containers are running"
else
    echo "✗ Some containers are not running"
    docker ps --format "table {{.Names}}\t{{.Status}}"
fi

# Test 2: Query channel information
echo ""
echo "Test 2: Querying channel information..."
setTrafficPeer

# Test traffic-channel
echo "Checking traffic-channel..."
peer channel list

peer channel getinfo -c traffic-channel

# Test 3: Query installed chaincode
echo ""
echo "Test 3: Querying installed chaincode..."
peer lifecycle chaincode queryinstalled

# Test 4: Invoke chaincode (query all vehicles)
echo ""
echo "Test 4: Testing chaincode invocation..."
peer chaincode query \
    -C traffic-channel \
    -n traffic-contract \
    -c '{"function":"queryAllVehicles","Args":[]}'

# Test 5: Create a test vehicle
echo ""
echo "Test 5: Creating a test vehicle..."
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    -C traffic-channel \
    -n traffic-contract \
    --tls \
    --cafile ${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
    -c '{"function":"createVehicle","Args":["TEST001","sedan","33.5731","-7.5898","moving"]}'

sleep 3

# Test 6: Query the created vehicle
echo ""
echo "Test 6: Querying the test vehicle..."
peer chaincode query \
    -C traffic-channel \
    -n traffic-contract \
    -c '{"function":"queryVehicle","Args":["TEST001"]}'

echo ""
echo "======================================"
echo "Network Testing Complete!"
echo "======================================"
echo ""
