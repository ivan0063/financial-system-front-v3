# Docker Deployment Guide

This guide covers deploying the Debt Control Frontend using Docker.

## Quick Start

### 1. Environment Setup

Create a `.env` file from the example:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit the `.env` file with your API configuration:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:666
API_BASE_URL=http://localhost:666
\`\`\`

### 2. Deploy with Script

The easiest way to deploy:

\`\`\`bash
# Make the script executable
chmod +x deploy.sh

# Deploy with default settings
./deploy.sh

# Deploy with custom API URL
API_BASE_URL=http://your-api-server:666 ./deploy.sh
\`\`\`

### 3. Deploy with Docker Compose

For a more robust setup:

\`\`\`bash
# Start the application
docker-compose up -d

# With custom API URL
API_BASE_URL=http://your-api-server:666 docker-compose up -d

# Include Nginx reverse proxy
docker-compose --profile with-nginx up -d
\`\`\`

## Manual Docker Commands

### Build the Image

\`\`\`bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:666 \
  -t debt-control-frontend .
\`\`\`

### Run the Container

\`\`\`bash
docker run -d \
  --name debt-control-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:666 \
  debt-control-frontend
\`\`\`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | API server URL | `http://localhost:666` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

### Docker Compose Profiles

- **Default**: Just the frontend application
- **with-nginx**: Includes Nginx reverse proxy

## Health Checks

The application includes a health check endpoint:

\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

Response:
\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "apiBaseUrl": "http://localhost:666"
}
\`\`\`

## Monitoring

### View Logs

\`\`\`bash
# View real-time logs
docker logs -f debt-control-frontend

# View last 50 lines
docker logs debt-control-frontend --tail 50
\`\`\`

### Container Status

\`\`\`bash
# Check container status
docker ps | grep debt-control-frontend

# View resource usage
docker stats debt-control-frontend
\`\`\`

## Troubleshooting

### Common Issues

1. **Container won't start**
   \`\`\`bash
   docker logs debt-control-frontend
   \`\`\`

2. **API connection issues**
   - Check `NEXT_PUBLIC_API_BASE_URL` environment variable
   - Verify API server is accessible from container

3. **Port conflicts**
   \`\`\`bash
   # Use different port
   docker run -p 3001:3000 debt-control-frontend
   \`\`\`

### Reset Everything

\`\`\`bash
# Stop and remove container
docker stop debt-control-frontend
docker rm debt-control-frontend

# Remove image
docker rmi debt-control-frontend

# Clean up unused resources
docker system prune
\`\`\`

## Production Deployment

### With SSL/HTTPS

1. Update `docker-compose.yml` with SSL certificates
2. Configure Nginx with SSL settings
3. Update API URLs to use HTTPS

### Scaling

\`\`\`bash
# Scale with Docker Compose
docker-compose up -d --scale debt-control-frontend=3
\`\`\`

### Backup

\`\`\`bash
# Export container
docker export debt-control-frontend > debt-control-backup.tar

# Save image
docker save debt-control-frontend > debt-control-image.tar
\`\`\`

## Development

### Development Mode

\`\`\`bash
# Run in development mode
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=development \
  -v $(pwd):/app \
  debt-control-frontend npm run dev
\`\`\`

### Debug Mode

\`\`\`bash
# Run with debug output
docker run -it --rm \
  -p 3000:3000 \
  debt-control-frontend sh
