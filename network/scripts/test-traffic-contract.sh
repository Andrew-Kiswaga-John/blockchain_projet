#!/bin/bash
source ./envVars.sh

echo "=== Testing Traffic Contract v6.0 with 3-org Endorsement ==="
echo ""

# Set environment for TrafficAuthority (for signing transactions)
export CORE_PEER_LOCALMSPID="TrafficAuthorityMSP"
export CORE_PEER_MSPCONFIGPATH="${NETWORK_PATH}/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp"
export FABRIC_CFG_PATH="${NETWORK_PATH}/config"
export CORE_PEER_TLS_ENABLED=true

echo "=== Test 1: Initialize Ledger (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C city-traffic-global -n traffic-contract \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.vehicleoperator.example.com:9051 \
    --tlsRootCertFiles $PEER0_VEHICLEOPERATOR_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"initLedger","Args":[]}'

echo ""
sleep 5

echo "=== Test 2: Query All Intersections ==="
export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051
export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_PATH}/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt"
peer chaincode query -C city-traffic-global -n traffic-contract \
    -c '{"function":"queryAllIntersections","Args":[]}'

echo ""
sleep 3

echo "=== Test 3: Create New Intersection (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C city-traffic-global -n traffic-contract \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.vehicleoperator.example.com:9051 \
    --tlsRootCertFiles $PEER0_VEHICLEOPERATOR_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"createIntersection","Args":["TEST_INT_001","Test Intersection 1","40.7589","-73.9851"]}'

echo ""
sleep 5

echo "=== Test 4: Query TEST_INT_001 ==="
export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051
peer chaincode query -C city-traffic-global -n traffic-contract \
    -c '{"function":"queryIntersection","Args":["TEST_INT_001"]}'

echo ""
sleep 3

echo "=== Test 5: Record Traffic Data (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C city-traffic-global -n traffic-contract \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.vehicleoperator.example.com:9051 \
    --tlsRootCertFiles $PEER0_VEHICLEOPERATOR_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"recordTrafficData","Args":["TEST_INT_001","75","45","MEDIUM"]}'

echo ""
sleep 5

echo "=== Test 6: Query After Traffic Update ==="
export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051
peer chaincode query -C city-traffic-global -n traffic-contract \
    -c '{"function":"queryIntersection","Args":["TEST_INT_001"]}'

echo ""
sleep 3

echo "=== Test 7: Update Traffic Light (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C city-traffic-global -n traffic-contract \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.vehicleoperator.example.com:9051 \
    --tlsRootCertFiles $PEER0_VEHICLEOPERATOR_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"updateTrafficLightStatus","Args":["TEST_INT_001","RED"]}'

echo ""
sleep 5

echo "=== Test 8: Final Query ==="
export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051
peer chaincode query -C city-traffic-global -n traffic-contract \
    -c '{"function":"queryIntersection","Args":["TEST_INT_001"]}'

echo ""
echo "=== TESTING COMPLETE ==="
