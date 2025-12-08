#!/bin/bash
# Test script for Traffic Core chaincode

export PATH=$PATH:~/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=~/hyperledger-fabric/fabric-samples/config
export CORE_PEER_TLS_ENABLED=true
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# Setup peer environment for TrafficMSP
export CORE_PEER_LOCALMSPID=TrafficMSP
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/users/Admin@traffic.example.com/msp

echo "=========================================="
echo "TRAFFIC CORE CHAINCODE TEST"
echo "=========================================="
echo ""

echo "1. Query All Vehicles:"
echo "-------------------------------------------"
peer chaincode query -C traffic-channel -n traffic-contract -c '{"function":"queryAllVehicles","Args":[]}'
echo ""

echo "2. Query Specific Vehicle (VEH001):"
echo "-------------------------------------------"
peer chaincode query -C traffic-channel -n traffic-contract -c '{"function":"queryVehicle","Args":["VEH001"]}'
echo ""

echo "3. Query All Intersections:"
echo "-------------------------------------------"
peer chaincode query -C traffic-channel -n traffic-contract -c '{"function":"queryAllIntersections","Args":[]}'
echo ""

echo "4. Update Vehicle Position (VEH001):"
echo "-------------------------------------------"
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer0.example.com --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C traffic-channel -n traffic-contract \
--peerAddresses localhost:7051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
--peerAddresses localhost:8051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer0.cityhall.example.com/tls/ca.crt \
--peerAddresses localhost:9051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer0.police.example.com/tls/ca.crt \
-c '{"function":"updatePosition","Args":["VEH001","33.5740","-7.5895","50"]}'
echo ""
sleep 2

echo "5. Query Updated Vehicle:"
echo "-------------------------------------------"
peer chaincode query -C traffic-channel -n traffic-contract -c '{"function":"queryVehicle","Args":["VEH001"]}'
echo ""

echo "6. Create New Vehicle (VEH999):"
echo "-------------------------------------------"
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer0.example.com --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C traffic-channel -n traffic-contract \
--peerAddresses localhost:7051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
--peerAddresses localhost:8051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer0.cityhall.example.com/tls/ca.crt \
--peerAddresses localhost:9051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer0.police.example.com/tls/ca.crt \
-c '{"function":"createVehicle","Args":["VEH999","motorcycle","33.5800","-7.5950","80","moving","PoliceMSP"]}'
echo ""
sleep 2

echo "7. Query New Vehicle (VEH999):"
echo "-------------------------------------------"
peer chaincode query -C traffic-channel -n traffic-contract -c '{"function":"queryVehicle","Args":["VEH999"]}'
echo ""

echo "8. Record Traffic Event:"
echo "-------------------------------------------"
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer0.example.com --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C traffic-channel -n traffic-contract \
--peerAddresses localhost:7051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
--peerAddresses localhost:8051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer0.cityhall.example.com/tls/ca.crt \
--peerAddresses localhost:9051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer0.police.example.com/tls/ca.crt \
-c '{"function":"recordTrafficEvent","Args":["EVT001","accident","33.5735","-7.5900","Accident at INT001","high"]}'
echo ""
sleep 2

echo "9. Query Traffic Events:"
echo "-------------------------------------------"
peer chaincode query -C traffic-channel -n traffic-contract -c '{"function":"queryTrafficEvents","Args":["active"]}'
echo ""

echo "10. Update Signal Status (INT001):"
echo "-------------------------------------------"
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer0.example.com --tls --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C traffic-channel -n traffic-contract \
--peerAddresses localhost:7051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
--peerAddresses localhost:8051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer0.cityhall.example.com/tls/ca.crt \
--peerAddresses localhost:9051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer0.police.example.com/tls/ca.crt \
-c '{"function":"updateSignalStatus","Args":["INT001","yellow"]}'
echo ""
sleep 2

echo "11. Query Updated Intersection:"
echo "-------------------------------------------"
peer chaincode query -C traffic-channel -n traffic-contract -c '{"function":"queryIntersection","Args":["INT001"]}'
echo ""

echo "=========================================="
echo "TEST COMPLETED"
echo "=========================================="
