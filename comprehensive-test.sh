#!/bin/bash
echo "🧪 COMPREHENSIVE BACKEND + CHAINCODE TEST"
echo "=========================================="
echo ""

echo "📊 Part 1: Testing Chaincode via CLI"
echo "------------------------------------"
cd ~/traffic-core

echo "✓ Traffic Statistics:"
docker exec -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_LOCALMSPID=TrafficAuthorityMSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp -e CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051 cli peer chaincode query -C city-traffic-global -n traffic-contract -c '{"function":"getTrafficStatistics","Args":[]}' 2>/dev/null

echo ""
echo "✓ Emergency Statistics:"
docker exec -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_LOCALMSPID=TrafficAuthorityMSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/peers/peer0.trafficauthority.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/trafficauthority.example.com/users/Admin@trafficauthority.example.com/msp -e CORE_PEER_ADDRESS=peer0.trafficauthority.example.com:7051 cli peer chaincode query -C emergency-ops -n emergency-contract -c '{"function":"getEmergencyStatistics","Args":[]}' 2>/dev/null

echo ""
echo ""
echo "🌐 Part 2: Testing Backend API"
echo "------------------------------------"
echo "Starting backend in background..."
cd ~/traffic-core/application/backend
export NETWORK_PATH=~/traffic-core/network
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "Waiting for backend to initialize..."
sleep 5

echo ""
echo "Testing API endpoints:"
echo ""

echo "1️⃣  GET /api/traffic/stats"
curl -s http://localhost:3000/api/traffic/stats | python3 -c "import sys, json; data=json.load(sys.stdin); print('   Status:', '✅ SUCCESS' if data.get('success') else '❌ FAILED'); print('   Data:', json.dumps(data.get('data', {}), indent=4))" || echo "   ❌ Request failed"

echo ""
echo "2️⃣  GET /api/emergencies/statistics"
curl -s http://localhost:3000/api/emergencies/statistics | python3 -c "import sys, json; data=json.load(sys.stdin); print('   Status:', '✅ SUCCESS' if data.get('success') else '❌ FAILED'); print('   Data:', json.dumps(data.get('data', {}), indent=4))" || echo "   ❌ Request failed"

echo ""
echo "3️⃣  GET /api/traffic/vehicles (intersections)"
curl -s http://localhost:3000/api/traffic/vehicles | python3 -c "import sys, json; data=json.load(sys.stdin); print('   Status:', '✅ SUCCESS' if data.get('success') else '❌ FAILED'); print('   Count:', len(data.get('data', [])))" || echo "   ❌ Request failed"

echo ""
echo ""
echo "🛑 Stopping backend..."
kill $BACKEND_PID 2>/dev/null
wait $BACKEND_PID 2>/dev/null

echo ""
echo "📋 Backend Log (last 30 lines):"
echo "------------------------------------"
tail -30 /tmp/backend.log | grep -v "node_modules"

echo ""
echo "✅ TEST COMPLETE!"
