#!/bin/bash
set -e

# Run standard network scripts
./init-traffic-ledger.sh
./init-emergency-ledger.sh

# Verify
echo "Verifying data..."
docker exec cli peer chaincode query -C city-traffic-global -n traffic-contract -c '{"function":"queryAllIntersections","Args":[]}'
docker exec cli peer chaincode query -C emergency-ops -n emergency-contract -c '{"function":"queryActiveEmergencies","Args":[]}'

echo "
=========================================================
✅ Ledger Initialization Complete!
If you saw JSON output above, your backend will now serve data.
=========================================================
"
