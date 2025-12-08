#!/bin/bash
#
# generate-crypto.sh - Generate cryptographic materials for all organizations
#

set -e

# Set environment variables
export PATH=$PATH:~/hyperledger-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=${PWD}

echo "======================================"
echo "Generating Crypto Materials"
echo "======================================"

# Remove existing crypto-config directory
if [ -d "crypto-config" ]; then
    echo "Removing existing crypto-config directory..."
    rm -rf crypto-config
fi

# Generate crypto materials using cryptogen
echo "Generating certificates using cryptogen tool..."
cryptogen generate --config=./crypto-config.yaml

if [ "$?" -ne 0 ]; then
    echo "Failed to generate crypto materials"
    exit 1
fi

echo ""
echo "======================================"
echo "Crypto materials generated successfully!"
echo "======================================"
echo ""
echo "Generated organizations:"
echo "  - OrdererOrg (example.com)"
echo "  - TrafficOrg (traffic.example.com)"
echo "  - CityHallOrg (cityhall.example.com)"
echo "  - PoliceOrg (police.example.com)"
echo "  - EmergencyOrg (emergency.example.com)"
echo ""
