#!/bin/bash
echo "Upgrading emergency-contract with CouchDB index..."

# Copy updated chaincode
cp -r /mnt/c/Users/Asus/Documents/S3/BLOCKCHAIN/ATELIER1/chaincode/emergency-contract ~/traffic-core/chaincode/

cd ~/traffic-core/network

# Package new version
echo "Packaging emergency-contract v1.1..."
peer lifecycle chaincode package ../chaincode-packages/emergency-contract-v1.1.tar.gz \
  --path ../chaincode/emergency-contract \
  --lang node \
  --label emergency-contract_1.1

# Install on all emergency-ops peers
echo "Installing on peer0.trafficauthority..."
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=TrafficAuthorityMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp
export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051

peer lifecycle chaincode install ../chaincode-packages/emergency-contract-v1.1.tar.gz

echo "Installing on peer0.emergency..."
export CORE_PEER_LOCALMSPID=EmergencyServicesMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/emergency.example.com/users/Admin@emergency.example.com/msp
export CORE_PEER_ADDRESS=peer0.emergency.example.com:13051

peer lifecycle chaincode install ../chaincode-packages/emergency-contract-v1.1.tar.gz

echo "Installing on peer0.infrastructure..."
export CORE_PEER_LOCALMSPID=InfrastructureOperatorMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/infrastructure.example.com/peers/peer0.infrastructure.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/infrastructure.example.com/users/Admin@infrastructure.example.com/msp
export CORE_PEER_ADDRESS=peer0.infrastructure.example.com:11051

peer lifecycle chaincode install ../chaincode-packages/emergency-contract-v1.1.tar.gz

# Get package ID
echo "Getting package ID..."
export CORE_PEER_LOCALMSPID=TrafficAuthorityMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp
export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051

PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep emergency-contract_1.1 | sed 's/Package ID: //' | sed 's/, Label:.*//')

echo "Package ID: $PACKAGE_ID"

# Approve for all 3 orgs
echo "Approving for TrafficAuthority..."
peer lifecycle chaincode approveformyorg -o orderer0.example.com:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --channelID emergency-ops \
  --name emergency-contract \
  --version 1.1 \
  --package-id $PACKAGE_ID \
  --sequence 2

echo "Approving for Emergency..."
export CORE_PEER_LOCALMSPID=EmergencyServicesMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/emergency.example.com/users/Admin@emergency.example.com/msp
export CORE_PEER_ADDRESS=peer0.emergency.example.com:13051

peer lifecycle chaincode approveformyorg -o orderer0.example.com:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --channelID emergency-ops \
  --name emergency-contract \
  --version 1.1 \
  --package-id $PACKAGE_ID \
  --sequence 2

echo "Approving for Infrastructure..."
export CORE_PEER_LOCALMSPID=InfrastructureOperatorMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/infrastructure.example.com/peers/peer0.infrastructure.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/infrastructure.example.com/users/Admin@infrastructure.example.com/msp
export CORE_PEER_ADDRESS=peer0.infrastructure.example.com:11051

peer lifecycle chaincode approveformyorg -o orderer0.example.com:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --channelID emergency-ops \
  --name emergency-contract \
  --version 1.1 \
  --package-id $PACKAGE_ID \
  --sequence 2

# Commit
echo "Committing chaincode..."
export CORE_PEER_LOCALMSPID=TrafficAuthorityMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp
export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051

peer lifecycle chaincode commit -o orderer0.example.com:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --channelID emergency-ops \
  --name emergency-contract \
  --version 1.1 \
  --sequence 2 \
  --peerAddresses peer0.trafficauthority.example.com:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt \
  --peerAddresses peer0.emergency.example.com:13051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt \
  --peerAddresses peer0.infrastructure.example.com:11051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/infrastructure.example.com/peers/peer0.infrastructure.example.com/tls/ca.crt

echo "Emergency contract upgraded to v1.1 with CouchDB index!"
