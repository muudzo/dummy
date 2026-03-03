#!/bin/bash
# Simple server startup script for the dummy website

echo "🚀 Starting TechHub Zimbabwe Website Server..."
echo ""
echo "📍 Website URL: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    python -m SimpleHTTPServer 8000
elif command -v npx &> /dev/null; then
    echo "Using Node.js..."
    npx http-server -p 8000
else
    echo "❌ Error: No server found!"
    echo "Please install Python or Node.js to run the server."
    exit 1
fi
