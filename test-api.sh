#!/bin/bash
echo "Testing backend API endpoints..."
echo ""

echo "1. Testing GET /api/traffic/stats:"
curl -s http://localhost:3000/api/traffic/stats | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✓ Success: {data['success']}\"); print(f\"  Intersections: {data.get('data', {}).get('totalIntersections', 'N/A')}\"); print(f\"  Vehicles: {data.get('data', {}).get('totalVehicles', 'N/A')}\")"

echo ""
echo "2. Testing GET /api/traffic/vehicles:"
curl -s http://localhost:3000/api/traffic/vehicles | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✓ Success: {data['success']}\"); print(f\"  Intersections returned: {len(data.get('data', []))}\")"

echo ""
echo "3. Testing GET /api/emergencies/statistics:"
curl -s http://localhost:3000/api/emergencies/statistics | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✓ Success: {data['success']}\"); print(f\"  Total: {data.get('data', {}).get('total', 'N/A')}\"); print(f\"  Active: {data.get('data', {}).get('active', 'N/A')}\")"

echo ""
echo "✅ All API endpoints tested!"
