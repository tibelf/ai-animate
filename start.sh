#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
PID_DIR="$ROOT_DIR/.pids"
PORT_FILE="$PID_DIR/port"

mkdir -p "$PID_DIR"

echo "🚀 Starting AI Animate System..."

check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Error: node is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ Error: npm is not installed"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
}

check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            return 1
        else
            return 0
        fi
    elif command -v nc &> /dev/null; then
        if nc -z localhost $port 2>/dev/null; then
            return 1
        else
            return 0
        fi
    else
        (echo >/dev/tcp/localhost/$port) 2>/dev/null
        if [ $? -eq 0 ]; then
            return 1
        else
            return 0
        fi
    fi
}

find_available_port() {
    local start_port=$1
    local max_attempts=100
    local port=$start_port
    
    for ((i=0; i<max_attempts; i++)); do
        if check_port $port; then
            echo $port
            return 0
        fi
        port=$((port + 1))
    done
    
    echo "❌ Error: Could not find an available port after $max_attempts attempts"
    exit 1
}

start_frontend() {
    echo ""
    echo "🎨 Starting Next.js application..."
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f ".env.local" ]; then
        echo "⚠️  Warning: .env.local not found. Creating from example..."
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            echo "⚠️  Please edit frontend/.env.local and add your API keys!"
        fi
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    local port
    echo "🔍 Checking port availability..."
    if check_port 3000; then
        port=3000
        echo "✅ Port 3000 is available"
    else
        echo "⚠️  Port 3000 is occupied, finding alternative port..."
        port=$(find_available_port 3001)
        echo "✅ Found available port: $port"
    fi
    
    echo $port > "$PORT_FILE"
    
    echo "🔄 Starting Next.js dev server on port $port..."
    nohup npm run dev -- -p $port > "$PID_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    
    echo "✅ Next.js started (PID: $FRONTEND_PID)"
    echo "   URL: http://localhost:$port"
    echo "   Logs: $PID_DIR/frontend.log"
}

wait_for_service() {
    echo ""
    echo "⏳ Waiting for Next.js to be ready..."
    sleep 3
    
    if ! kill -0 $(cat "$PID_DIR/frontend.pid" 2>/dev/null) 2>/dev/null; then
        echo "❌ Next.js failed to start. Check logs at $PID_DIR/frontend.log"
        echo ""
        echo "📋 Last 20 lines of log:"
        tail -n 20 "$PID_DIR/frontend.log" 2>/dev/null || echo "No log available"
        exit 1
    fi
}

main() {
    check_dependencies
    start_frontend
    wait_for_service
    
    local port=$(cat "$PORT_FILE")
    
    echo ""
    echo "🎉 AI Animate System is running!"
    echo ""
    echo "📍 Application:"
    echo "   - URL: http://localhost:$port"
    if [ "$port" != "3000" ]; then
        echo "   - Note: Using port $port because 3000 was occupied"
    fi
    echo ""
    echo "📊 Monitor logs:"
    echo "   - tail -f $PID_DIR/frontend.log"
    echo ""
    echo "🛑 To stop: ./stop.sh"
}

main
