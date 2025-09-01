# Docker Setup for Asubeb Backend

This document provides comprehensive instructions for running the Asubeb Backend application using Docker.

## 🐳 Overview

The Docker setup includes:
- **NestJS Backend Application** - The main API server
- **PostgreSQL Database** - Primary database for the application
- **Prisma Studio** - Database management interface (optional)

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- At least 2GB of available RAM
- Ports 3000, 5432, and 5555 available

## 🚀 Quick Start

### Production Environment

1. **Clone and navigate to the project:**
   ```bash
   cd asubeb-backend
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

4. **Access the application:**
   - API: http://localhost:3000/api/v1
   - Swagger Documentation: http://localhost:3000/api
   - Database: localhost:5432

### Development Environment

1. **Start development services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
   ```

3. **Access development tools:**
   - API: http://localhost:3000/api/v1
   - Swagger Documentation: http://localhost:3000/api
   - Prisma Studio: http://localhost:5555
   - Database: localhost:5432

## 📁 File Structure

```
asubeb-backend/
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── .dockerignore           # Files to exclude from build
└── DOCKER_README.md        # This file
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (configured in docker-compose files):

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` / `development` |
| `PORT` | Application port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@postgres:5432/asubeb_db` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-change-in-production` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000,http://localhost:3001,http://localhost:5173` |

### Database Configuration

- **Host**: `postgres` (container name)
- **Port**: `5432`
- **Database**: `asubeb_db` (production) / `asubeb_db_dev` (development)
- **Username**: `postgres`
- **Password**: `password`

## 🛠️ Available Commands

### Production Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart a specific service
docker-compose restart backend

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Access Prisma Studio (optional)
docker-compose --profile tools up prisma-studio
```

### Development Commands

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Stop development services
docker-compose -f docker-compose.dev.yml down

# View development logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Run tests
docker-compose -f docker-compose.dev.yml exec backend npm test

# Run linting
docker-compose -f docker-compose.dev.yml exec backend npm run lint

# Access development shell
docker-compose -f docker-compose.dev.yml exec backend sh
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5432
   
   # Stop conflicting services
   docker-compose down
   ```

2. **Database connection issues:**
   ```bash
   # Check database health
   docker-compose exec postgres pg_isready -U postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Application won't start:**
   ```bash
   # Check application logs
   docker-compose logs backend
   
   # Rebuild the image
   docker-compose build --no-cache backend
   ```

4. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Health Checks

The services include health checks to ensure they're running properly:

- **PostgreSQL**: Checks database connectivity
- **Backend**: Checks API endpoint availability

### Logs

View logs for debugging:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f backend
```

## 🔒 Security Considerations

### Production Deployment

1. **Change default passwords:**
   - Update `POSTGRES_PASSWORD` in docker-compose.yml
   - Update `JWT_SECRET` with a strong secret

2. **Use environment files:**
   ```bash
   # Create .env file
   cp env.example .env
   
   # Update docker-compose.yml to use .env file
   env_file:
     - .env
   ```

3. **Network security:**
   - Use Docker secrets for sensitive data
   - Configure proper firewall rules
   - Use reverse proxy (nginx) in production

4. **Database security:**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups

## 📊 Monitoring

### Container Status

```bash
# Check container status
docker-compose ps

# Check resource usage
docker stats
```

### Database Monitoring

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d asubeb_db

# Check database size
docker-compose exec postgres psql -U postgres -d asubeb_db -c "SELECT pg_size_pretty(pg_database_size('asubeb_db'));"
```

## 🧹 Cleanup

### Remove Everything

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove all unused Docker resources
docker system prune -a
```

### Development Cleanup

```bash
# Stop and remove development containers
docker-compose -f docker-compose.dev.yml down -v
```

## 📝 Additional Notes

- The development environment includes hot reload for faster development
- Prisma Studio is available on port 5555 for database management
- Database data is persisted in Docker volumes
- Uploads directory is mounted as a volume for file persistence
- Health checks ensure services are running properly

## 🤝 Contributing

When contributing to the Docker setup:

1. Test both development and production configurations
2. Update this README with any changes
3. Ensure backward compatibility
4. Test on different operating systems if possible

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `docker-compose logs`
3. Ensure Docker Desktop is running
4. Verify port availability
5. Check system resources (RAM, disk space)
