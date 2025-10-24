#!/bin/bash

echo "🛑 Stopping Next.js processes..."

pkill -f "next dev" 2>/dev/null && echo "✅ Stopped Next.js dev server" || echo "⚠️  No Next.js processes found"

echo ""
echo "✅ Cleanup complete"
