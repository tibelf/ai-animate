#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
PID_DIR="$ROOT_DIR/.pids"

mkdir -p "$PID_DIR"

echo "🚀 Starting AI Animate System..."

check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Error: python3 is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Error: node is not installed"
        exit 1
    fi
    
    if ! command -v poetry &> /dev/null; then
        echo "⚠️  Warning: poetry is not installed. Installing..."
        pip install poetry
    fi
    
    echo "✅ Dependencies check passed"
}

start_backend() {
    echo ""
    echo "🔧 Starting backend service..."
    
    cd "$BACKEND_DIR"
    
    if [ ! -f "config.yaml" ]; then
        echo "⚠️  Warning: config.yaml not found. Creating from example..."
        if [ -f "config.yaml.example" ]; then
            cp config.yaml.example config.yaml
            echo "⚠️  Please edit backend/config.yaml and add your API keys!"
        else
            echo "❌ Error: config.yaml.example not found"
            exit 1
        fi
    fi
    
    if [ ! -d ".venv" ]; then
        echo "📦 Installing backend dependencies..."
        poetry install
    fi
    
    echo "🔄 Starting backend server..."
    nohup poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$PID_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_DIR/backend.pid"
    
    echo "✅ Backend started (PID: $BACKEND_PID)"
    echo "   URL: http://localhost:8000"
    echo "   Logs: $PID_DIR/backend.log"
}

start_frontend() {
    echo ""
    echo "🎨 Starting frontend service..."
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f ".env.local" ]; then
        echo "⚠️  Warning: .env.local not found. Creating from example..."
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
        fi
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    echo "🔄 Starting frontend server..."
    nohup npm run dev > "$PID_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
    echo "   URL: http://localhost:3000"
    echo "   Logs: $PID_DIR/frontend.log"
}

wait_for_services() {
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 3
    
    if ! kill -0 $(cat "$PID_DIR/backend.pid" 2>/dev/null) 2>/dev/null; then
        echo "❌ Backend failed to start. Check logs at $PID_DIR/backend.log"
        exit 1
    fi
    
    if ! kill -0 $(cat "$PID_DIR/frontend.pid" 2>/dev/null) 2>/dev/null; then
        echo "❌ Frontend failed to start. Check logs at $PID_DIR/frontend.log"
        exit 1
    fi
}

main() {
    check_dependencies
    start_backend
    start_frontend
    wait_for_services
    
    echo ""
    echo "🎉 AI Animate System is running!"
    echo ""
    echo "📍 Services:"
    echo "   - Backend:  http://localhost:8000"
    echo "   - Frontend: http://localhost:3000"
    echo "   - API Docs: http://localhost:8000/docs"
    echo ""
    echo "📊 Monitor logs:"
    echo "   - Backend:  tail -f $PID_DIR/backend.log"
    echo "   - Frontend: tail -f $PID_DIR/frontend.log"
    echo ""
    echo "🛑 To stop: ./stop.sh"
}

main
