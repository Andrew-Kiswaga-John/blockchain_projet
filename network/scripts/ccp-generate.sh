#!/bin/bash

# Generates Connection Profiles (CCP) for all organizations

function one_line_pem {
    sed ':a;N;$!ba;s/\r//g;s/\n/\\n/g' $1
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s/\${org}/$6/" \
        scripts/ccp-template.json
}

echo "Generating Connection Profiles..."

# ORG 1: TrafficAuthority
ORG="TrafficAuthority"
APP_ORG="trafficauthority"
DOMAIN_ORG="trafficauthority"
P0PORT=7051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/tlsca/tlsca.${DOMAIN_ORG}.example.com-cert.pem
CAPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/ca/ca.${DOMAIN_ORG}.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $DOMAIN_ORG)" > organizations/peerOrganizations/${DOMAIN_ORG}.example.com/connection-${APP_ORG}.json
echo "Generated connection-${APP_ORG}.json"

# ORG 2: VehicleOperator
ORG="VehicleOperator"
APP_ORG="vehicleoperator"
DOMAIN_ORG="vehicleoperator"
P0PORT=9051
CAPORT=9054
PEERPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/tlsca/tlsca.${DOMAIN_ORG}.example.com-cert.pem
CAPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/ca/ca.${DOMAIN_ORG}.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $DOMAIN_ORG)" > organizations/peerOrganizations/${DOMAIN_ORG}.example.com/connection-${APP_ORG}.json
echo "Generated connection-${APP_ORG}.json"

# ORG 3: InfrastructureOperator
ORG="InfrastructureOperator"
APP_ORG="infrastructureoperator"
DOMAIN_ORG="infrastructure"
P0PORT=11051
CAPORT=10054
PEERPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/tlsca/tlsca.${DOMAIN_ORG}.example.com-cert.pem
CAPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/ca/ca.${DOMAIN_ORG}.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $DOMAIN_ORG)" > organizations/peerOrganizations/${DOMAIN_ORG}.example.com/connection-${APP_ORG}.json
echo "Generated connection-${APP_ORG}.json"

# ORG 4: EmergencyServices
ORG="EmergencyServices"
APP_ORG="emergencyservices"
DOMAIN_ORG="emergency"
P0PORT=13051
CAPORT=11054
PEERPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/tlsca/tlsca.${DOMAIN_ORG}.example.com-cert.pem
CAPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/ca/ca.${DOMAIN_ORG}.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $DOMAIN_ORG)" > organizations/peerOrganizations/${DOMAIN_ORG}.example.com/connection-${APP_ORG}.json
echo "Generated connection-${APP_ORG}.json"

# ORG 5: ParkingManagement
ORG="ParkingManagement"
APP_ORG="parkingmanagement"
DOMAIN_ORG="parking"
P0PORT=15051
CAPORT=12054
PEERPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/tlsca/tlsca.${DOMAIN_ORG}.example.com-cert.pem
CAPEM=organizations/peerOrganizations/${DOMAIN_ORG}.example.com/ca/ca.${DOMAIN_ORG}.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $DOMAIN_ORG)" > organizations/peerOrganizations/${DOMAIN_ORG}.example.com/connection-${APP_ORG}.json
echo "Generated connection-${APP_ORG}.json"

echo "Done."
