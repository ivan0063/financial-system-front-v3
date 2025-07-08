#!/bin/bash

# Debt Control Frontend Deployment Script
set -e

echo "🚀 Starting deployment of Debt Control Frontend..."

# Default values
API_BASE_URL=${API_BASE_URL:-"http://192.168.50.180:666"}
CONTAINER_NAME="debt-control-frontend"
IMAGE_NAME="debt-control-frontend"
PORT=${PORT:-3000}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running ✓"

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    print_status "Stopping existing container..."
    docker stop ${CONTAINER_NAME} || true
    docker rm ${CONTAINER_NAME} || true
fi

# Remove existing image if it exists
if docker images --format 'table {{.Repository}}' | grep -q "^${IMAGE_NAME}$"; then
    print_status "Removing existing image..."
    docker rmi ${IMAGE_NAME} || true
fi

# Build the Docker image
print_status "Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Run the container
print_status "Starting container with API URL: ${API_BASE_URL}"
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:3000 \
    -e NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL} \
    --restart unless-stopped \
    ${IMAGE_NAME}

# Wait for container to be ready
print_status "Waiting for application to start..."
sleep 10

# Health check
if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
    print_status "✅ Deployment successful!"
    print_status "Application is running at: http://localhost:${PORT}"
    print_status "API Base URL: ${API_BASE_URL}"
    print_status "Health check: http://localhost:${PORT}/api/health"
else
    print_error "❌ Health check failed. Check container logs:"
    docker logs ${CONTAINER_NAME}
    exit 1
fi

# Show container status
print_status "Container status:"
docker ps --filter name=${CONTAINER_NAME}

print_status "🎉 Deployment completed successfully!"
