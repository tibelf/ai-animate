#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
PID_DIR="$ROOT_DIR/.pids"

mkdir -p "$PID_DIR"

echo "🚀 Starting AI Animate System..."

check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Error: node is not installed"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
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
    
    echo "🔄 Starting development server..."
    nohup npm run dev > "$PID_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    
    echo "✅ Next.js started (PID: $FRONTEND_PID)"
    echo "   URL: http://localhost:3000"
    echo "   Logs: $PID_DIR/frontend.log"
}

wait_for_service() {
    echo ""
    echo "⏳ Waiting for service to be ready..."
    sleep 3
    
    if ! kill -0 $(cat "$PID_DIR/frontend.pid" 2>/dev/null) 2>/dev/null; then
        echo "❌ Next.js failed to start. Check logs at $PID_DIR/frontend.log"
        exit 1
    fi
}

main() {
    check_dependencies
    start_frontend
    wait_for_service
    
    echo ""
    echo "🎉 AI Animate System is running!"
    echo ""
    echo "📍 Service:"
    echo "   - Application: http://localhost:3000"
    echo "   - API Routes:  http://localhost:3000/api/*"
    echo ""
    echo "📊 Monitor logs:"
    echo "   - tail -f $PID_DIR/frontend.log"
    echo ""
    echo "🛑 To stop: ./stop.sh"
}

main
