#!/bin/bash
# RAKBANK Flowable POC — Quick Start

echo "════════════════════════════════════════════"
echo "  RAKBANK Flowable POC — Starting..."
echo "════════════════════════════════════════════"

# Start backend in background
echo ""
echo "▶ Starting Spring Boot backend (port 8080)..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "  Waiting for backend..."
until curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; do
  sleep 2
done
echo "  ✅ Backend ready at http://localhost:8080"

# Start frontend
echo ""
echo "▶ Starting React frontend (port 3000)..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "════════════════════════════════════════════"
echo "  ✅ Both services running!"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080"
echo "  Swagger:   http://localhost:8080/swagger-ui.html"
echo "  H2 DB:     http://localhost:8080/h2-console"
echo ""
echo "  Press Ctrl+C to stop both services"
echo "════════════════════════════════════════════"

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
