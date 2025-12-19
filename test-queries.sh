#!/bin/bash
echo "Testing chaincode queries..."
echo ""

echo "1. Testing queryAllIntersections (traffic-contract):"
docker exec \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_LOCALMSPID=TrafficAuthorityMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051 \
  cli peer chaincode query \
  -C city-traffic-global \
  -n traffic-contract \
  -c '{"function":"queryAllIntersections","Args":[]}'

echo ""
echo "2. Testing getTrafficStatistics (traffic-contract):"
docker exec \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_LOCALMSPID=TrafficAuthorityMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051 \
  cli peer chaincode query \
  -C city-traffic-global \
  -n traffic-contract \
  -c '{"function":"getTrafficStatistics","Args":[]}'

echo ""
echo "3. Testing queryActiveEmergencies (emergency-contract):"
docker exec \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_LOCALMSPID=TrafficAuthorityMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051 \
  cli peer chaincode query \
  -C emergency-ops \
  -n emergency-contract \
  -c '{"function":"queryActiveEmergencies","Args":[]}'

echo ""
echo "4. Testing getEmergencyStatistics (emergency-contract):"
docker exec \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_LOCALMSPID=TrafficAuthorityMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051 \
  cli peer chaincode query \
  -C emergency-ops \
  -n emergency-contract \
  -c '{"function":"getEmergencyStatistics","Args":[]}'
