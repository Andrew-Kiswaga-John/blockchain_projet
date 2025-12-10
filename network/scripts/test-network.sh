#!/bin/bash

# Test script for Traffic Core Network
# This script verifies that all containers and channels are working

echo "======================================"
echo "Traffic Core Network - Comprehensive Test"
echo "======================================"
echo ""

# Source environment variables
. scripts/envVars.sh

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
        ((TESTS_FAILED++))
    fi
}

echo "Test 1: Checking container count..."
CONTAINER_COUNT=$(docker ps | tail -n +2 | wc -l)
if [ $CONTAINER_COUNT -eq 30 ]; then
    print_result 0 "All 30 containers are running"
else
    print_result 1 "Expected 30 containers, found $CONTAINER_COUNT"
fi
echo ""

echo "Test 2: Testing TrafficAuthority peer0 channel membership..."
setGlobals TrafficAuthority 0
CHANNELS=$(docker exec cli peer channel list 2>&1 | grep -E "city-traffic-global|emergency-channel" | wc -l)
if [ $CHANNELS -eq 2 ]; then
    print_result 0 "TrafficAuthority peer0 joined both channels"
else
    print_result 1 "TrafficAuthority peer0 channel membership issue"
fi
echo ""

echo "Test 3: Testing VehicleOperator peer0 channel membership..."
setGlobals VehicleOperator 0
CHANNELS=$(docker exec cli peer channel list 2>&1 | grep "city-traffic-global" | wc -l)
if [ $CHANNELS -eq 1 ]; then
    print_result 0 "VehicleOperator peer0 joined city-traffic-global"
else
    print_result 1 "VehicleOperator peer0 channel membership issue"
fi
echo ""

echo "Test 4: Testing Emergency peer0 channel membership..."
setGlobals Emergency 0
CHANNELS=$(docker exec cli peer channel list 2>&1 | grep -E "city-traffic-global|emergency-channel" | wc -l)
if [ $CHANNELS -eq 2 ]; then
    print_result 0 "Emergency peer0 joined both channels"
else
    print_result 1 "Emergency peer0 channel membership issue"
fi
echo ""

echo "Test 5: Testing Infrastructure peer0 channel membership..."
setGlobals Infrastructure 0
CHANNELS=$(docker exec cli peer channel list 2>&1 | grep -E "city-traffic-global|emergency-channel" | wc -l)
if [ $CHANNELS -eq 2 ]; then
    print_result 0 "Infrastructure peer0 joined both channels"
else
    print_result 1 "Infrastructure peer0 channel membership issue"
fi
echo ""

echo "Test 6: Testing Parking peer0 channel membership..."
setGlobals Parking 0
CHANNELS=$(docker exec cli peer channel list 2>&1 | grep "city-traffic-global" | wc -l)
if [ $CHANNELS -eq 1 ]; then
    print_result 0 "Parking peer0 joined city-traffic-global"
else
    print_result 1 "Parking peer0 channel membership issue"
fi
echo ""

echo "Test 7: Getting city-traffic-global channel info..."
setGlobals TrafficAuthority 0
CHANNEL_INFO=$(docker exec cli peer channel getinfo -c city-traffic-global 2>&1)
if echo "$CHANNEL_INFO" | grep -q "Blockchain info"; then
    BLOCK_HEIGHT=$(echo "$CHANNEL_INFO" | grep "height" | awk '{print $2}')
    print_result 0 "city-traffic-global is active (Height: $BLOCK_HEIGHT)"
else
    print_result 1 "Could not get city-traffic-global info"
fi
echo ""

echo "Test 8: Getting emergency-channel info..."
setGlobals TrafficAuthority 0
CHANNEL_INFO=$(docker exec cli peer channel getinfo -c emergency-channel 2>&1)
if echo "$CHANNEL_INFO" | grep -q "Blockchain info"; then
    BLOCK_HEIGHT=$(echo "$CHANNEL_INFO" | grep "height" | awk '{print $2}')
    print_result 0 "emergency-channel is active (Height: $BLOCK_HEIGHT)"
else
    print_result 1 "Could not get emergency-channel info"
fi
echo ""

echo "Test 9: Testing orderer connectivity..."
setGlobals TrafficAuthority 0
ORDERER_STATUS=$(docker exec cli peer channel fetch config /dev/null -c city-traffic-global -o orderer0.example.com:7050 --tls --cafile $ORDERER_CA 2>&1)
if echo "$ORDERER_STATUS" | grep -q "Received block"; then
    print_result 0 "Orderer is responding to requests"
else
    print_result 1 "Orderer connectivity issue"
fi
echo ""

echo "Test 10: Testing peer health endpoints..."
HEALTH_CHECK=$(curl -s http://localhost:9446/healthz)
if echo "$HEALTH_CHECK" | grep -q "OK"; then
    print_result 0 "Peer health endpoint responding"
else
    print_result 1 "Peer health endpoint not responding"
fi
echo ""

echo "Test 11: Testing CouchDB connectivity..."
COUCHDB_CHECK=$(curl -s http://localhost:5984/_up)
if echo "$COUCHDB_CHECK" | grep -q "ok"; then
    print_result 0 "CouchDB is accessible"
else
    print_result 1 "CouchDB connectivity issue"
fi
echo ""

echo "Test 12: Verifying CA services..."
CA_CHECK=$(curl -sk https://localhost:8054/cainfo | grep -q "trafficauthority" && echo "OK" || echo "FAIL")
if [ "$CA_CHECK" = "OK" ]; then
    print_result 0 "Certificate Authority is running"
else
    print_result 1 "Certificate Authority issue"
fi
echo ""

echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Network is healthy and ready for Phase 3.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Review the output above.${NC}"
    exit 1
fi
