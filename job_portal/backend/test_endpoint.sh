#!/bin/bash

echo "Testing Resume Upload Endpoint"
echo "=============================="
echo ""

# Test if backend is running
echo "1. Checking if backend is running..."
curl -s http://localhost:8000/docs > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✓ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   Start it with: uvicorn app.main:app --reload"
    exit 1
fi

echo ""
echo "2. Testing POST /resume/upload endpoint..."

# Create a dummy file
echo "dummy content" > /tmp/test.pdf

# Test the endpoint
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8000/resume/upload \
  -F "file=@/tmp/test.pdf")

status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

echo "   Status Code: $status_code"

if [ "$status_code" = "405" ]; then
    echo "   ❌ ERROR: Method Not Allowed"
    echo "   The endpoint may not be registered"
elif [ "$status_code" = "422" ]; then
    echo "   ✓ Endpoint exists (validation error expected)"
    echo "   Response: $body"
elif [ "$status_code" = "200" ]; then
    echo "   ✓ Endpoint is working!"
    echo "   Response: $body"
else
    echo "   Response: $body"
fi

# Clean up
rm /tmp/test.pdf

echo ""
echo "=============================="
echo "Visit http://localhost:8000/docs to see all endpoints"
