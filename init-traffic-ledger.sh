#!/bin/bash
echo "Initializing traffic-contract ledger..."
docker exec \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_LOCALMSPID=TrafficAuthorityMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051 \
  cli peer chaincode invoke \
  -o orderer0.example.com:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C city-traffic-global \
  -n traffic-contract \
  --peerAddresses peer0.trafficauthority.example.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt \
  --peerAddresses peer0.emergency.example.com:13051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt \
  --peerAddresses peer0.infrastructure.example.com:11051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/infrastructure.example.com/peers/peer0.infrastructure.example.com/tls/ca.crt \
  --waitForEvent \
  -c '{"function":"initLedger","Args":[]}'
echo ""
echo "Waiting for transaction to be committed..."
sleep 3
echo "Traffic ledger initialized!"
