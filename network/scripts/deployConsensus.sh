#!/bin/bash
# Wrapper to deploy the consensus-contract to city-traffic-global channel

echo "Deploying Consensus Contract..."
./deployChaincode.sh deployAll -n consensus-contract -c city-traffic-global -p ../../chaincode/consensus-contract -v 1.0 -s 1
