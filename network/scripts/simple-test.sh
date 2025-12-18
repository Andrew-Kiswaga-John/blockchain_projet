#!/bin/bash

echo "=== Testing emergency-ops channel ==="

# Test 1: Query chaincode
echo ""
echo "Test 1: Query emergency statistics..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/tmp/adminmsp/msp peer0.emergency.example.com \
  peer chaincode query -C emergency-ops -n emergency-contract \
  -c '{"function":"getEmergencyStatistics","Args":[]}'

# Test 2: Create fire emergency
echo ""
echo "Test 2: Create fire emergency..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/tmp/adminmsp/msp peer0.emergency.example.com \
  peer chaincode invoke -o orderer0.example.com:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  -C emergency-ops -n emergency-contract \
  --tls --cafile /tmp/orderer-tlsca.pem \
  -c '{"function":"createEmergency","Args":["TEST-FIRE-001","fire","high","40.7128","-74.0060","123 Main St","Fire at building"]}'

sleep 3

# Test 3: Query again
echo ""
echo "Test 3: Query statistics after creation..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/tmp/adminmsp/msp peer0.emergency.example.com \
  peer chaincode query -C emergency-ops -n emergency-contract \
  -c '{"function":"getEmergencyStatistics","Args":[]}'

echo ""
echo "=== Tests complete ==="
