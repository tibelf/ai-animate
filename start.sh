#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Parse command line arguments
USE_MOCK_MODE="false"
SHOW_HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --mock)
            USE_MOCK_MODE="true"
            shift
            ;;
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Use --help to see available options"
            exit 1
            ;;
    esac
done

if [ "$SHOW_HELP" = true ]; then
    echo "AI Animate System - Start Script"
    echo ""
    echo "Usage: ./start.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --mock       Start in Mock mode (use fake data, no real API calls)"
    echo "  --help, -h   Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh              # Start in production mode (real API)"
    echo "  ./start.sh --mock       # Start in Mock mode (fake data)"
    exit 0
fi

echo "🚀 Starting AI Animate System..."
if [ "$USE_MOCK_MODE" = "true" ]; then
    echo "🎭 Mode: Mock (using fake data)"
else
    echo "🔧 Mode: Production (using real API)"
fi

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

setup_environment() {
    cd "$FRONTEND_DIR"
    
    if [ ! -f ".env.local" ]; then
        echo "⚠️  Warning: .env.local not found. Creating from example..."
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            echo "📝 Created .env.local from example"
        fi
    fi
    
    # Update NEXT_PUBLIC_USE_MOCK_API in .env.local based on --mock flag
    if [ -f ".env.local" ]; then
        if grep -q "NEXT_PUBLIC_USE_MOCK_API" ".env.local"; then
            # Update existing value
            if [ "$USE_MOCK_MODE" = "true" ]; then
                sed -i.bak 's/^NEXT_PUBLIC_USE_MOCK_API=.*/NEXT_PUBLIC_USE_MOCK_API=true/' .env.local
                echo "✅ Mock mode enabled in .env.local"
            else
                sed -i.bak 's/^NEXT_PUBLIC_USE_MOCK_API=.*/NEXT_PUBLIC_USE_MOCK_API=false/' .env.local
                echo "✅ Production mode enabled in .env.local"
            fi
            rm -f .env.local.bak
        else
            # Add the variable if it doesn't exist
            echo "" >> .env.local
            if [ "$USE_MOCK_MODE" = "true" ]; then
                echo "NEXT_PUBLIC_USE_MOCK_API=true" >> .env.local
                echo "✅ Mock mode enabled in .env.local"
            else
                echo "NEXT_PUBLIC_USE_MOCK_API=false" >> .env.local
                echo "✅ Production mode enabled in .env.local"
            fi
        fi
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
}

start_server() {
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
    
    echo ""
    echo "🎨 Starting Next.js dev server on port $port..."
    echo "📍 URL: http://localhost:$port"
    echo ""
    echo "💡 Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    npm run dev -- -p $port
}

cleanup() {
    echo ""
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🛑 Shutting down..."
    exit 0
}

trap cleanup SIGINT SIGTERM

main() {
    check_dependencies
    setup_environment
    start_server
}

main
