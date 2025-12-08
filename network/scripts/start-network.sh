#!/bin/bash
#
# start-network.sh - Start all network components
#

set -e

echo "======================================"
echo "Starting Hyperledger Fabric Network"
echo "======================================"

# Start Certificate Authorities (will create network automatically)
echo "Starting Certificate Authorities..."
docker-compose -f docker-compose-ca.yaml up -d

echo "Waiting for CAs to start..."
sleep 5

# Start Orderers
echo "Starting Orderer nodes..."
docker-compose -f docker-compose-orderer.yaml up -d

echo "Waiting for orderers to start..."
sleep 10

# Start Peers
echo "Starting Peer nodes..."
docker-compose -f docker-compose-peers.yaml up -d

echo "Waiting for peers to start..."
sleep 10

echo ""
echo "======================================"
echo "Network Started Successfully!"
echo "======================================"
echo ""
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
