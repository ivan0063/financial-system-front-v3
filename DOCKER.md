# Docker Deployment Guide

This guide explains how to deploy the Debt Control Frontend using Docker.

## Prerequisites

- Docker installed and running
- Docker Compose (optional, for advanced setups)

## Quick Start

### 1. Environment Setup

Create a `.env` file or set environment variables:

\`\`\`bash
export API_BASE_URL=http://your-api-host:port
\`\`\`

### 2. Deploy with Script

\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 3. Deploy with Docker Compose

\`\`\`bash
# Basic deployment
API_BASE_URL=http://your-api-host:port docker-compose up --build -d

# With nginx reverse proxy
API_BASE_URL=http://your-api-host:port docker-compose --profile with-nginx up --build -d
\`\`\`

## Manual Deployment

### Build Image

\`\`\`bash
docker build -t debt-control-frontend .
\`\`\`

### Run Container

\`\`\`bash
docker run -d \
  --name debt-control-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-api-host:port \
  --restart unless-stopped \
  debt-control-frontend
\`\`\`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://192.168.50.180:666` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `production` |

### Health Check

The application includes a health check endpoint:

\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

## Monitoring

### View Logs

\`\`\`bash
docker logs debt-control-frontend
\`\`\`

### Container Status

\`\`\`bash
docker ps --filter name=debt-control-frontend
\`\`\`

### Resource Usage

\`\`\`bash
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
   - Change the port mapping: `-p 8080:3000`

### Debug Mode

Run container in interactive mode:

\`\`\`bash
docker run -it --rm \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-api-host:port \
  debt-control-frontend sh
\`\`\`

## Production Considerations

### SSL/HTTPS

For production, use a reverse proxy like nginx:

\`\`\`yaml
# docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
\`\`\`

### Performance

- Use multi-stage builds (already implemented)
- Enable gzip compression in reverse proxy
- Set up CDN for static assets

### Security

- Run as non-root user (already implemented)
- Use secrets for sensitive environment variables
- Enable security headers in reverse proxy

## Scaling

### Docker Swarm

\`\`\`bash
docker service create \
  --name debt-control-frontend \
  --replicas 3 \
  --publish 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-api-host:port \
  debt-control-frontend
\`\`\`

### Kubernetes

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: debt-control-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: debt-control-frontend
  template:
    metadata:
      labels:
        app: debt-control-frontend
    spec:
      containers:
      - name: debt-control-frontend
        image: debt-control-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_BASE_URL
          value: "http://your-api-host:port"
