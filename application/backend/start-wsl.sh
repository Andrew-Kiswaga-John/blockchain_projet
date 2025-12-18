#!/bin/bash

echo "🚀 Starting Traffic Core Backend in WSL..."

cd ~/traffic-core/application/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "▶️  Starting server..."
npm start
