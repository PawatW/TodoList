#!/bin/bash
set -e

echo "=== TodoList App Setup ==="

# Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q

echo "🚀 Starting backend server (port 8000)..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

cd ..

# Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --silent

echo "🚀 Starting frontend dev server (port 5173)..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ App is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs:    http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers."

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

wait
