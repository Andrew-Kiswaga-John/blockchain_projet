#!/bin/bash
# approve-upgrade.sh - Approve chaincode upgrade

set -e

export PATH=$PATH:~/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=~/hyperledger-fabric/fabric-samples/config
export CORE_PEER_TLS_ENABLED=true

PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
PACKAGE_ID="traffic-contract_1.2:6bb424c55e83a01e80298a566e62b3429ac9d89b588660d293846bdec3d64ed1"

# Approve for Traffic
echo "Approving for Traffic..."
CORE_PEER_LOCALMSPID=TrafficMSP \
CORE_PEER_ADDRESS=localhost:7051 \
CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/users/Admin@traffic.example.com/msp \
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --channelID traffic-channel \
  --name traffic-contract \
  --version 1.2 \
  --package-id $PACKAGE_ID \
  --sequence 3 \
  --tls \
  --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Approve for CityHall
echo "Approving for CityHall..."
CORE_PEER_LOCALMSPID=CityHallMSP \
CORE_PEER_ADDRESS=localhost:8051 \
CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer0.cityhall.example.com/tls/ca.crt \
CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/users/Admin@cityhall.example.com/msp \
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --channelID traffic-channel \
  --name traffic-contract \
  --version 1.2 \
  --package-id $PACKAGE_ID \
  --sequence 3 \
  --tls \
  --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Approve for Police
echo "Approving for Police..."
CORE_PEER_LOCALMSPID=PoliceMSP \
CORE_PEER_ADDRESS=localhost:9051 \
CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer0.police.example.com/tls/ca.crt \
CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/users/Admin@police.example.com/msp \
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --channelID traffic-channel \
  --name traffic-contract \
  --version 1.2 \
  --package-id $PACKAGE_ID \
  --sequence 3 \
  --tls \
  --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Approve for Emergency
echo "Approving for Emergency..."
CORE_PEER_LOCALMSPID=EmergencyMSP \
CORE_PEER_ADDRESS=localhost:10051 \
CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt \
CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/emergency.example.com/users/Admin@emergency.example.com/msp \
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --channelID traffic-channel \
  --name traffic-contract \
  --version 1.2 \
  --package-id $PACKAGE_ID \
  --sequence 3 \
  --tls \
  --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Check commit readiness
echo "Checking commit readiness..."
CORE_PEER_LOCALMSPID=TrafficMSP \
CORE_PEER_ADDRESS=localhost:7051 \
CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/users/Admin@traffic.example.com/msp \
peer lifecycle chaincode checkcommitreadiness \
  --channelID traffic-channel \
  --name traffic-contract \
  --version 1.2 \
  --sequence 3 \
  --tls \
  --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --output json

# Commit
echo "Committing chaincode..."
CORE_PEER_LOCALMSPID=TrafficMSP \
CORE_PEER_ADDRESS=localhost:7051 \
CORE_PEER_TLS_ROOTCERT_FILE=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
CORE_PEER_MSPCONFIGPATH=${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/users/Admin@traffic.example.com/msp \
peer lifecycle chaincode commit \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer0.example.com \
  --channelID traffic-channel \
  --name traffic-contract \
  --version 1.2 \
  --sequence 3 \
  --tls \
  --cafile ${PROJECT_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --peerAddresses localhost:7051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/traffic.example.com/peers/peer0.traffic.example.com/tls/ca.crt \
  --peerAddresses localhost:8051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/cityhall.example.com/peers/peer0.cityhall.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/police.example.com/peers/peer0.police.example.com/tls/ca.crt \
  --peerAddresses localhost:10051 --tlsRootCertFiles ${PROJECT_DIR}/crypto-config/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt

echo "Chaincode upgrade completed!"
