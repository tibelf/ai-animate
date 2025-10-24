#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/.pids"

echo "🛑 Stopping AI Animate System..."

stop_service() {
    local service_name=$1
    local pid_file="$PID_DIR/${service_name}.pid"
    
    if [ ! -f "$pid_file" ]; then
        echo "⚠️  $service_name PID file not found. Service may not be running."
        return
    fi
    
    local pid=$(cat "$pid_file")
    
    if ! kill -0 "$pid" 2>/dev/null; then
        echo "⚠️  $service_name (PID: $pid) is not running."
        rm -f "$pid_file"
        return
    fi
    
    echo "🔄 Stopping $service_name (PID: $pid)..."
    kill "$pid" 2>/dev/null || true
    
    local timeout=10
    local count=0
    while kill -0 "$pid" 2>/dev/null && [ $count -lt $timeout ]; do
        sleep 1
        count=$((count + 1))
    done
    
    if kill -0 "$pid" 2>/dev/null; then
        echo "⚠️  $service_name did not stop gracefully. Force killing..."
        kill -9 "$pid" 2>/dev/null || true
    fi
    
    rm -f "$pid_file"
    echo "✅ $service_name stopped"
}

cleanup_node_processes() {
    echo "🧹 Cleaning up any remaining Node.js processes..."
    pkill -f "next dev" 2>/dev/null || true
}

cleanup_python_processes() {
    echo "🧹 Cleaning up any remaining uvicorn processes..."
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
}

main() {
    if [ ! -d "$PID_DIR" ]; then
        echo "❌ No PID directory found. Services may not be running."
        exit 0
    fi
    
    stop_service "frontend"
    stop_service "backend"
    
    cleanup_node_processes
    cleanup_python_processes
    
    if [ -d "$PID_DIR" ] && [ -z "$(ls -A $PID_DIR/*.pid 2>/dev/null)" ]; then
        rm -f "$PID_DIR"/*.log 2>/dev/null || true
    fi
    
    echo ""
    echo "✅ AI Animate System stopped successfully"
}

main
