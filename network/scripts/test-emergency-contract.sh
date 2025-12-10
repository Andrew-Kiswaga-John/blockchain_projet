#!/bin/bash
source ./envVars.sh

echo "=== Testing Emergency Contract v2.0 with 3-org Endorsement ==="
echo ""

# Set environment for EmergencyServices (for signing transactions)
export CORE_PEER_LOCALMSPID="EmergencyServicesMSP"
export CORE_PEER_MSPCONFIGPATH="${NETWORK_PATH}/organizations/peerOrganizations/emergency.example.com/users/Admin@emergency.example.com/msp"
export FABRIC_CFG_PATH="${NETWORK_PATH}/config"
export CORE_PEER_TLS_ENABLED=true

echo "=== Test 1: Initialize Ledger (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C emergency-channel -n emergency-contract \
    --peerAddresses peer0.emergency.example.com:13051 \
    --tlsRootCertFiles $PEER0_EMERGENCY_CA \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"initLedger","Args":[]}'

echo ""
sleep 5

echo "=== Test 2: Query All Emergencies ==="
export CORE_PEER_ADDRESS=peer0.emergency.example.com:13051
export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_PATH}/organizations/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt"
peer chaincode query -C emergency-channel -n emergency-contract \
    -c '{"function":"queryActiveEmergencies","Args":[]}'

echo ""
sleep 3

echo "=== Test 3: Create Emergency (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C emergency-channel -n emergency-contract \
    --peerAddresses peer0.emergency.example.com:13051 \
    --tlsRootCertFiles $PEER0_EMERGENCY_CA \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"createEmergency","Args":["EMG_TEST_001","MEDICAL","CRITICAL","40.7580","-73.9855","Times Square NYC","Medical emergency"]}'

echo ""
sleep 5

echo "=== Test 4: Query EMG_TEST_001 ==="
export CORE_PEER_ADDRESS=peer0.emergency.example.com:13051
peer chaincode query -C emergency-channel -n emergency-contract \
    -c '{"function":"queryEmergency","Args":["EMG_TEST_001"]}'

echo ""
sleep 3

echo "=== Test 5: Assign Vehicle (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C emergency-channel -n emergency-contract \
    --peerAddresses peer0.emergency.example.com:13051 \
    --tlsRootCertFiles $PEER0_EMERGENCY_CA \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"assignVehicle","Args":["EMG_TEST_001","AMBULANCE-911"]}'

echo ""
sleep 5

echo "=== Test 6: Query After Assignment ==="
export CORE_PEER_ADDRESS=peer0.emergency.example.com:13051
peer chaincode query -C emergency-channel -n emergency-contract \
    -c '{"function":"queryEmergency","Args":["EMG_TEST_001"]}'

echo ""
sleep 3

echo "=== Test 7: Update Status (3-org endorsement) ==="
peer chaincode invoke \
    -o orderer0.example.com:7050 \
    --ordererTLSHostnameOverride orderer0.example.com \
    --tls --cafile $ORDERER_CA \
    -C emergency-channel -n emergency-contract \
    --peerAddresses peer0.emergency.example.com:13051 \
    --tlsRootCertFiles $PEER0_EMERGENCY_CA \
    --peerAddresses peer0.trafficauthority.example.com:7051 \
    --tlsRootCertFiles $PEER0_TRAFFICAUTHORITY_CA \
    --peerAddresses peer0.infrastructure.example.com:11051 \
    --tlsRootCertFiles $PEER0_INFRASTRUCTURE_CA \
    -c '{"function":"updateEmergencyStatus","Args":["EMG_TEST_001","RESOLVED","Patient transported to hospital successfully"]}'

echo ""
sleep 5

echo "=== Test 8: Final Query ==="
export CORE_PEER_ADDRESS=peer0.emergency.example.com:13051
peer chaincode query -C emergency-channel -n emergency-contract \
    -c '{"function":"queryEmergency","Args":["EMG_TEST_001"]}'

echo ""
echo "=== TESTING COMPLETE ==="
