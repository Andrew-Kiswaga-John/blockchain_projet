#!/bin/bash
#
# ==============================================================================
# Environment Variables Setup Script
# ==============================================================================
# This script sets environment variables for peer CLI commands
# Usage: source ./envVars.sh
# ==============================================================================

# Set base network path
export NETWORK_PATH=$HOME/traffic-core/network

# Add Fabric binaries to PATH
export PATH=$PATH:$HOME/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=$HOME/traffic-core/network/config

# Orderer CA
export ORDERER_CA="${NETWORK_PATH}/organizations/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Peer CA certificates for commit operations
export PEER0_TRAFFICAUTHORITY_CA="${NETWORK_PATH}/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt"
export PEER0_VEHICLEOPERATOR_CA="${NETWORK_PATH}/organizations/peerOrganizations/vehicleoperator.example.com/peers/peer0.vehicleoperator.example.com/tls/ca.crt"
export PEER0_INFRASTRUCTURE_CA="${NETWORK_PATH}/organizations/peerOrganizations/infrastructure.example.com/peers/peer0.infrastructure.example.com/tls/ca.crt"
export PEER0_EMERGENCY_CA="${NETWORK_PATH}/organizations/peerOrganizations/emergency.example.com/peers/peer0.emergency.example.com/tls/ca.crt"
export PEER0_PARKING_CA="${NETWORK_PATH}/organizations/peerOrganizations/parking.example.com/peers/peer0.parking.example.com/tls/ca.crt"

# Set environment variables for a specific organization and peer
# Usage: setGlobals <org> <peer>
# Example: setGlobals TrafficAuthority 0
function setGlobals() {
    local ORG=$1
    local PEER=$2
    
    case $ORG in
        TrafficAuthority)
            export CORE_PEER_LOCALMSPID="TrafficAuthorityMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_PATH}/organizations/peerOrganizations/trafficauthority.example.com/peers/peer${PEER}.trafficauthority.example.com/tls/ca.crt"
            export CORE_PEER_MSPCONFIGPATH="${NETWORK_PATH}/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp"
            
            if [ $PEER -eq 0 ]; then
                export CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051
            else
                export CORE_PEER_ADDRESS=peer1.trafficauthority.example.com:8051
            fi
            ;;
        
        VehicleOperator)
            export CORE_PEER_LOCALMSPID="VehicleOperatorMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_PATH}/organizations/peerOrganizations/vehicleoperator.example.com/peers/peer${PEER}.vehicleoperator.example.com/tls/ca.crt"
            export CORE_PEER_MSPCONFIGPATH="${NETWORK_PATH}/organizations/peerOrganizations/vehicleoperator.example.com/users/Admin@vehicleoperator.example.com/msp"
            
            if [ $PEER -eq 0 ]; then
                export CORE_PEER_ADDRESS=peer0.vehicleoperator.example.com:9051
            else
                export CORE_PEER_ADDRESS=peer1.vehicleoperator.example.com:10051
            fi
            ;;
        
        InfrastructureOperator)
            export CORE_PEER_LOCALMSPID="InfrastructureOperatorMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_PATH}/organizations/peerOrganizations/infrastructure.example.com/peers/peer${PEER}.infrastructure.example.com/tls/ca.crt"
            export CORE_PEER_MSPCONFIGPATH="${NETWORK_PATH}/organizations/peerOrganizations/infrastructure.example.com/users/Admin@infrastructure.example.com/msp"
            
            if [ $PEER -eq 0 ]; then
                export CORE_PEER_ADDRESS=peer0.infrastructure.example.com:11051
            else
                export CORE_PEER_ADDRESS=peer1.infrastructure.example.com:12051
            fi
            ;;
        
        EmergencyServices)
            export CORE_PEER_LOCALMSPID="EmergencyServicesMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_PATH}/organizations/peerOrganizations/emergency.example.com/peers/peer${PEER}.emergency.example.com/tls/ca.crt"
            export CORE_PEER_MSPCONFIGPATH="${NETWORK_PATH}/organizations/peerOrganizations/emergency.example.com/users/Admin@emergency.example.com/msp"
            
            if [ $PEER -eq 0 ]; then
                export CORE_PEER_ADDRESS=peer0.emergency.example.com:13051
            else
                export CORE_PEER_ADDRESS=peer1.emergency.example.com:14051
            fi
            ;;
        
        ParkingManagement)
            export CORE_PEER_LOCALMSPID="ParkingManagementMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_PATH}/organizations/peerOrganizations/parking.example.com/peers/peer${PEER}.parking.example.com/tls/ca.crt"
            export CORE_PEER_MSPCONFIGPATH="${NETWORK_PATH}/organizations/peerOrganizations/parking.example.com/users/Admin@parking.example.com/msp"
            
            if [ $PEER -eq 0 ]; then
                export CORE_PEER_ADDRESS=peer0.parking.example.com:15051
            else
                export CORE_PEER_ADDRESS=peer1.parking.example.com:16051
            fi
            ;;
        
        *)
            echo "ERROR: Unknown organization: $ORG"
            exit 1
            ;;
    esac
    
    # Common settings
    export FABRIC_CFG_PATH="${NETWORK_PATH}/config"
    export CORE_PEER_TLS_ENABLED=true
    
    # Print current context
    echo "Using organization: $ORG, peer$PEER"
    echo "MSP ID: ${CORE_PEER_LOCALMSPID}"
    echo "Peer Address: ${CORE_PEER_ADDRESS}"
}

# Verify peer is running
function verifyPeer() {
    local ORG=$1
    local PEER=$2
    
    setGlobals $ORG $PEER
    
    peer channel list &>/dev/null
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Peer ${PEER} of ${ORG} is not reachable"
        return 1
    else
        echo "Peer ${PEER} of ${ORG} is running"
        return 0
    fi
}

# Print organization info
function printOrgInfo() {
    echo ""
    echo "Available Organizations:"
    echo "  - TrafficAuthority (peers: 0, 1)"
    echo "  - VehicleOperator (peers: 0, 1)"
    echo "  - InfrastructureOperator (peers: 0, 1)"
    echo "  - EmergencyServices (peers: 0, 1)"
    echo "  - ParkingManagement (peers: 0, 1)"
    echo ""
}
