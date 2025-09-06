# Comprehensive Banking Application - Docker Setup

## Quick Start

### Basic Docker Setup
```bash
# Build and run the basic application
docker build -t razz_bank .
docker run -p 5000:5000 razz_bank
```

### Full Infrastructure with Docker Compose
```bash
# Start the complete banking infrastructure
docker-compose up -d

# For development mode
docker-compose --profile development up -d

# For production mode with load balancing
docker-compose --profile production up -d
```

## Services

### Core Services
- **razz-bank-app**: Main Flask banking application (port 5000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Session management and caching (port 6379)
- **nginx**: Reverse proxy and load balancer (port 80)

### Monitoring & Management
- **adminer**: Database administration tool (port 8080)
- **prometheus**: Metrics collection (port 9090)
- **grafana**: Monitoring dashboards (port 3000)
- **fluentd**: Log aggregation (port 24224)

### Load Balancing (Production Profile)
- **haproxy**: Load balancer with health checks (port 8081)
- **haproxy-stats**: Load balancer statistics (port 8082)

## Environment Profiles

### Development Profile
- Uses SQLite database
- Flask debug mode enabled
- Volume mounting for live code changes
- Single application instance

### Production Profile
- PostgreSQL database
- Redis session management
- Nginx reverse proxy
- HAProxy load balancing
- Comprehensive monitoring
- Log aggregation

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Banking App | http://localhost:5000 | admin/admin123!@# |
| Database Admin | http://localhost:8080 | postgres/secure_bank_password_2025 |
| Grafana | http://localhost:3000 | admin/admin_grafana_2025 |
| Prometheus | http://localhost:9090 | - |
| HAProxy Stats | http://localhost:8082/stats | - |

## Volumes

- `app_data`: Application data persistence
- `postgres_data`: Database data persistence
- `redis_data`: Redis data persistence
- `prometheus_data`: Metrics data persistence
- `grafana_data`: Dashboard configurations

## Network

- Custom bridge network: `razz_bank_network` (172.20.0.0/16)
- All services communicate through internal network
- Only necessary ports exposed to host

## Security Features

- Non-root user in containers
- SSL/TLS configuration ready
- Rate limiting on sensitive endpoints
- Security headers configuration
- Health checks for all services

## Monitoring

- Application health checks
- Database connection monitoring
- Resource usage tracking
- Log aggregation and analysis
- Performance metrics collection

## Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f razz-bank-app

# Scale the application
docker-compose up -d --scale razz-bank-app=3

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Update and restart a service
docker-compose up -d --build razz-bank-app
```