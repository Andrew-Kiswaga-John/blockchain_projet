#!/bin/bash
#
# stop-network.sh - Stop and clean up the network
#

set -e

echo "======================================"
echo "Stopping Hyperledger Fabric Network"
echo "======================================"

# Stop all containers
echo "Stopping all containers..."
docker-compose -f docker-compose-peers.yaml down
docker-compose -f docker-compose-orderer.yaml down
docker-compose -f docker-compose-ca.yaml down

# Remove chaincode containers and images
echo "Removing chaincode containers and images..."
docker ps -a | grep dev-peer | awk '{print $1}' | xargs -r docker rm -f
docker images | grep dev-peer | awk '{print $3}' | xargs -r docker rmi -f

# Optional: Remove volumes (uncomment if you want to clean all data)
# docker volume prune -f

echo ""
echo "======================================"
echo "Network Stopped Successfully!"
echo "======================================"
echo ""
