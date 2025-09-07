#!/usr/bin/env python3
"""
Razz Bank Advanced Multi-Vulnerability Training Platform
Educational Cybersecurity Training Application
"""

from flask import Flask, render_template, request, session, redirect, url_for, jsonify, make_response
import sqlite3
import hashlib
import secrets
import os
import jwt
import redis
from datetime import datetime, timedelta
from functools import wraps

# Database imports
try:
    import psycopg2
    import psycopg2.extras
    HAS_POSTGRESQL = True
except ImportError:
    HAS_POSTGRESQL = False

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', secrets.token_hex(16))

# JWT Configuration - Intentionally weak for educational purposes
JWT_SECRET = os.environ.get('JWT_SECRET', 'weak_secret_key_2024')
JWT_ALGORITHM = 'HS256'

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///razz_bank.db')
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')
USE_POSTGRESQL = DATABASE_URL.startswith('postgresql://') and HAS_POSTGRESQL

# Initialize Redis client (optional, fallback gracefully)
try:
    redis_client = redis.from_url(REDIS_URL)
    redis_client.ping()
    USE_REDIS = True
except:
    USE_REDIS = False
    redis_client = None

def get_db_connection():
    """Get database connection based on configuration"""
    if USE_POSTGRESQL:
        return psycopg2.connect(DATABASE_URL)
    else:
        return sqlite3.connect('razz_bank.db')

def execute_query(query, params=None, fetch=None):
    """Execute database query with proper connection handling"""
    conn = get_db_connection()
    
    if USE_POSTGRESQL:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Convert SQLite placeholders to PostgreSQL format
        if '?' in query:
            query = query.replace('?', '%s')
    else:
        cursor = conn.cursor()
    
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch == 'one':
            result = cursor.fetchone()
        elif fetch == 'all':
            result = cursor.fetchall()
        else:
            result = None
        
        conn.commit()
        return result
    finally:
        cursor.close()
        conn.close()

# Add custom Jinja2 filters
@app.template_filter('format_transaction_type')
def format_transaction_type(txn_type):
    type_map = {
        'transfer': 'Transfer',
        'bill_payment': 'Bill Payment',
        'deposit': 'Deposit',
        'withdrawal': 'Withdrawal',
        'other': 'Other'
    }
    return type_map.get(txn_type, txn_type.replace('_', ' ').title())

# JWT Helper Functions
def generate_jwt_token(user_id, username, role):
    """Generate JWT token - intentionally using weak secret for educational purposes"""
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(f):
    """JWT authentication decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token[7:]  # Remove 'Bearer ' prefix
            payload = verify_jwt_token(token)
            if payload:
                request.current_user = payload
                return f(*args, **kwargs)
        
        return jsonify({'error': 'Invalid or missing JWT token'}), 401
    return decorated_function

# Database initialization
def init_db():
    """Initialize database with proper schema for SQLite or PostgreSQL"""
    
    if USE_POSTGRESQL:
        # PostgreSQL schema
        tables = {
            'users': '''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    account_number VARCHAR(50) UNIQUE NOT NULL,
                    balance DECIMAL(10,2) DEFAULT 1000.00,
                    role VARCHAR(50) DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'transactions': '''
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    from_account VARCHAR(50),
                    to_account VARCHAR(50),
                    amount DECIMAL(10,2),
                    description TEXT,
                    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    transaction_type VARCHAR(50) DEFAULT 'transfer'
                )
            ''',
            'loan_applications': '''
                CREATE TABLE IF NOT EXISTS loan_applications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    loan_amount DECIMAL(10,2),
                    loan_purpose TEXT,
                    employment_status TEXT,
                    annual_income DECIMAL(10,2),
                    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'pending'
                )
            ''',
            'system_flags': '''
                CREATE TABLE IF NOT EXISTS system_flags (
                    id SERIAL PRIMARY KEY,
                    flag_name VARCHAR(255),
                    flag_value TEXT,
                    description TEXT
                )
            '''
        }
    else:
        # SQLite schema (existing)
        tables = {
            'users': '''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    email TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    account_number TEXT UNIQUE NOT NULL,
                    balance DECIMAL(10,2) DEFAULT 1000.00,
                    role TEXT DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'transactions': '''
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    from_account TEXT,
                    to_account TEXT,
                    amount DECIMAL(10,2),
                    description TEXT,
                    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    transaction_type TEXT DEFAULT 'transfer'
                )
            ''',
            'loan_applications': '''
                CREATE TABLE IF NOT EXISTS loan_applications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    loan_amount DECIMAL(10,2),
                    loan_purpose TEXT,
                    employment_status TEXT,
                    annual_income DECIMAL(10,2),
                    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'pending',
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''',
            'system_flags': '''
                CREATE TABLE IF NOT EXISTS system_flags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    flag_name TEXT,
                    flag_value TEXT,
                    description TEXT
                )
            '''
        }
    
    # Create tables
    for table_name, schema in tables.items():
        execute_query(schema)
    
    # Insert the real flag
    flag_query = '''
        INSERT INTO system_flags (flag_name, flag_value, description) 
        VALUES (%s, %s, %s) ON CONFLICT DO NOTHING
    ''' if USE_POSTGRESQL else '''
        INSERT OR REPLACE INTO system_flags (flag_name, flag_value, description) 
        VALUES (?, ?, ?)
    '''
    
    execute_query(flag_query, ('admin_flag', 'RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}', 'Main challenge flag'))
    
    # Create admin user
    admin_password = hashlib.sha256('admin123!@#'.encode()).hexdigest()
    admin_query = '''
        INSERT INTO users (username, password, email, full_name, account_number, balance, role) 
        VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (username) DO NOTHING
    ''' if USE_POSTGRESQL else '''
        INSERT OR REPLACE INTO users (username, password, email, full_name, account_number, balance, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    '''
    
    execute_query(admin_query, ('admin', admin_password, 'admin@razzbank.com', 
                               'System Administrator', 'ADM001', 999999.99, 'admin'))
    
    # Generate regular users
    users_data = []
    for i in range(1, 88):
        username = f'user{i:03d}'
        password = hashlib.sha256(f'password{i}'.encode()).hexdigest()
        email = f'user{i:03d}@razzbank.com'
        full_name = f'User {i:03d} LastName'
        account_number = f'RB{i:06d}'
        balance = round(1000 + (i * 123.45), 2)
        
        users_data.append((username, password, email, full_name, account_number, balance, 'user'))
    
    # Batch insert users
    users_query = '''
        INSERT INTO users (username, password, email, full_name, account_number, balance, role) 
        VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (username) DO NOTHING
    ''' if USE_POSTGRESQL else '''
        INSERT OR REPLACE INTO users (username, password, email, full_name, account_number, balance, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    '''
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if USE_POSTGRESQL:
            psycopg2.extras.execute_batch(cursor, users_query, users_data)
        else:
            cursor.executemany(users_query, users_data)
        
        # Add sample transactions
        sample_transactions = [
            ('RB000001', 'RB000002', 500.00, 'Payment for services'),
            ('RB000003', 'RB000001', 250.75, 'Refund transaction'),
            ('RB000002', 'RB000004', 1000.00, 'Loan payment'),
        ]
        
        trans_query = '''
            INSERT INTO transactions (from_account, to_account, amount, description) 
            VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING
        ''' if USE_POSTGRESQL else '''
            INSERT OR REPLACE INTO transactions (from_account, to_account, amount, description) 
            VALUES (?, ?, ?, ?)
        '''
        
        if USE_POSTGRESQL:
            psycopg2.extras.execute_batch(cursor, trans_query, sample_transactions)
        else:
            cursor.executemany(trans_query, sample_transactions)
        
        conn.commit()
        print(f"✅ Database initialized successfully ({'PostgreSQL' if USE_POSTGRESQL else 'SQLite'})")
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# Vulnerable login function (intentionally vulnerable for educational purposes)
def check_login(username, password):
    """
    VULNERABLE SQL QUERY - This is intentionally vulnerable for the challenge
    In production, this should NEVER be done!
    """
    conn = get_db_connection()
    
    if USE_POSTGRESQL:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    else:
        cursor = conn.cursor()
    
    # VULNERABLE SQL QUERY - Intentional for educational purposes
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    
    try:
        cursor.execute(query)
        result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        print(f"SQL Error (educational): {e}")
        conn.close()
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        
        # Hash the password for comparison
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Check login (vulnerable function)
        user = check_login(username, hashed_password)
        
        if user:
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['role'] = user[7]
            
            # Check if JWT authentication is requested
            use_jwt = request.form.get('use_jwt', False) or request.headers.get('Accept') == 'application/json'
            
            if use_jwt:
                token = generate_jwt_token(user[0], user[1], user[7])
                return jsonify({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user[0],
                        'username': user[1],
                        'role': user[7],
                        'account_number': user[5]
                    }
                })
            
            return redirect(url_for('dashboard'))
        else:
            if request.headers.get('Accept') == 'application/json':
                return jsonify({'error': 'Invalid credentials'}), 401
            return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        full_name = request.form.get('full_name')
        
        if not all([username, password, email, full_name]):
            return render_template('register.html', error='All fields are required')
        
        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Generate account number
        account_number = f'RB{secrets.randbelow(999999):06d}'
        
        try:
            conn = sqlite3.connect('razz_bank.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (username, password, email, full_name, account_number) 
                VALUES (?, ?, ?, ?, ?)
            ''', (username, hashed_password, email, full_name, account_number))
            conn.commit()
            conn.close()
            
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            return render_template('register.html', error='Username already exists')
    
    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
    user = cursor.fetchone()
    conn.close()
    
    return render_template('dashboard.html', user=user)

@app.route('/account-settings', methods=['GET', 'POST'])
def account_settings():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'update_profile':
            full_name = request.form.get('full_name', '').strip()
            email = request.form.get('email', '').strip()
            
            if full_name and email:
                cursor.execute('''
                    UPDATE users SET full_name = ?, email = ? WHERE id = ?
                ''', (full_name, email, session['user_id']))
                conn.commit()
                conn.close()
                return render_template('account_settings.html', success='Profile updated successfully')
            else:
                conn.close()
                return render_template('account_settings.html', error='All fields are required')
        
        elif action == 'change_password':
            current_password = request.form.get('current_password', '')
            new_password = request.form.get('new_password', '')
            confirm_password = request.form.get('confirm_password', '')
            
            if not all([current_password, new_password, confirm_password]):
                conn.close()
                return render_template('account_settings.html', error='All password fields are required')
            
            if new_password != confirm_password:
                conn.close()
                return render_template('account_settings.html', error='New passwords do not match')
            
            # Verify current password
            current_hash = hashlib.sha256(current_password.encode()).hexdigest()
            cursor.execute('SELECT password FROM users WHERE id = ?', (session['user_id'],))
            stored_password = cursor.fetchone()
            
            if stored_password and stored_password[0] == current_hash:
                new_hash = hashlib.sha256(new_password.encode()).hexdigest()
                cursor.execute('UPDATE users SET password = ? WHERE id = ?', (new_hash, session['user_id']))
                conn.commit()
                conn.close()
                return render_template('account_settings.html', success='Password changed successfully')
            else:
                conn.close()
                return render_template('account_settings.html', error='Current password is incorrect')
    
    # GET request - show user info
    cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
    user = cursor.fetchone()
    conn.close()
    
    return render_template('account_settings.html', user=user)

@app.route('/statements')
def statements():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    
    # Get user info
    cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return redirect(url_for('login'))
    
    # Get all transactions for this account
    account_number = user[5]
    cursor.execute('''
        SELECT transaction_date, description, amount, from_account, to_account
        FROM transactions 
        WHERE from_account = ? OR to_account = ?
        ORDER BY transaction_date DESC 
        LIMIT 50
    ''', (account_number, account_number))
    
    transactions = cursor.fetchall()
    conn.close()
    
    # Format transactions for display
    formatted_transactions = []
    for txn in transactions:
        is_credit = txn[4] == account_number and txn[3] != account_number
        amount = txn[2] if is_credit else -txn[2]
        
        # Determine transaction type based on description
        description = txn[1].lower()
        if 'bill payment' in description:
            txn_type = 'bill_payment'
        elif 'transfer' in description:
            txn_type = 'transfer'
        elif 'deposit' in description or 'salary' in description:
            txn_type = 'deposit'
        elif 'withdrawal' in description or 'atm' in description:
            txn_type = 'withdrawal'
        else:
            txn_type = 'other'
        
        formatted_transactions.append({
            'date': txn[0],
            'description': txn[1],
            'amount': amount,
            'type': txn_type,
            'from_account': txn[3],
            'to_account': txn[4]
        })
    
    return render_template('statements.html', user=user, transactions=formatted_transactions)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# IDOR Vulnerability - View any user's profile by ID
@app.route('/profile/<int:user_id>')
def view_profile(user_id):
    """VULNERABLE: No authorization check - IDOR vulnerability"""
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, email, full_name, account_number, balance, role FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user[0],
        'username': user[1],
        'email': user[2],
        'full_name': user[3],
        'account_number': user[4],
        'balance': float(user[5]),
        'role': user[6]
    })

# IDOR Vulnerability - View any account's transactions
@app.route('/account/<account_number>/transactions')
def view_account_transactions(account_number):
    """VULNERABLE: No authorization check - IDOR vulnerability"""
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    
    # Get transactions for the specified account
    cursor.execute('''
        SELECT t.*, u.full_name as account_holder
        FROM transactions t
        LEFT JOIN users u ON u.account_number = t.from_account OR u.account_number = t.to_account
        WHERE t.from_account = ? OR t.to_account = ?
        ORDER BY t.transaction_date DESC LIMIT 20
    ''', (account_number, account_number))
    
    transactions = cursor.fetchall()
    conn.close()
    
    return jsonify({
        'account_number': account_number,
        'transactions': [
            {
                'id': t[0],
                'from_account': t[1],
                'to_account': t[2],
                'amount': float(t[3]),
                'description': t[4],
                'date': t[5],
                'type': t[6]
            } for t in transactions
        ]
    })

# Admin panel with weak authorization
@app.route('/admin/users')
def admin_users():
    """VULNERABLE: Weak authorization check"""
    # Check if user claims to be admin (easily bypassed)
    is_admin = request.args.get('admin', '').lower() == 'true' or session.get('role') == 'admin'
    
    if not is_admin:
        return jsonify({'error': 'Access denied - Admin privileges required'}), 403
    
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, email, full_name, account_number, balance, role FROM users LIMIT 50')
    users = cursor.fetchall()
    conn.close()
    
    return jsonify({
        'users': [
            {
                'id': u[0],
                'username': u[1],
                'email': u[2],
                'full_name': u[3],
                'account_number': u[4],
                'balance': float(u[5]),
                'role': u[6]
            } for u in users
        ]
    })

@app.route('/robots.txt')
def robots():
    return '''User-agent: *
Disallow: /admin/
Disallow: /backup/
Disallow: /config/
Allow: /

# RAZZ{y0U#H@v3$f()<]UNd^F@K3|FL4G}
# This is just a decoy flag, keep looking!
'''

@app.route('/sitemap.xml')
def sitemap():
    return '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://razzbank.local/</loc></url>
    <url><loc>https://razzbank.local/login</loc></url>
    <url><loc>https://razzbank.local/register</loc></url>
    <!-- RAZZ{y0U_H@v3^f(){UNd}/F@K3~FL4G} -->
</urlset>'''

@app.route('/admin')
def admin_fake():
    response = make_response('Access Denied')
    response.set_cookie('debug_flag', 'RAZZ{y0U!H@v3<f()>UNd&F@K3?FL4G}')
    return response, 403

@app.route('/backup')
def backup_fake():
    return '''<html><body>
<!-- RAZZ{y0U+H@v3^f()[UNd]$F@K3=FL4G} -->
<h1>Backup Directory</h1>
<p>Access denied. This directory contains sensitive backups.</p>
</body></html>''', 403

@app.route('/health')
def health_check():
    """Health check endpoint for Docker and load balancers"""
    try:
        # Test database connection
        conn = sqlite3.connect('razz_bank.db')
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': 'connected',
            'version': '1.0.0'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }), 503

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """JWT-based authentication endpoint"""
    try:
        data = request.get_json() or {}
        username = data.get('username', '')
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        # Hash the password for comparison
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Check login (vulnerable function)
        user = check_login(username, hashed_password)
        
        if user:
            token = generate_jwt_token(user[0], user[1], user[7])
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[3],
                    'full_name': user[4],
                    'account_number': user[5],
                    'balance': float(user[6]),
                    'role': user[7]
                }
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': 'Authentication failed'}), 500

@app.route('/api/auth/verify', methods=['POST'])
def api_verify_token():
    """Verify JWT token"""
    try:
        data = request.get_json() or {}
        token = data.get('token', '')
        
        if not token:
            return jsonify({'error': 'Token required'}), 400
        
        payload = verify_jwt_token(token)
        if payload:
            return jsonify({
                'valid': True,
                'user': {
                    'id': payload['user_id'],
                    'username': payload['username'],
                    'role': payload['role']
                }
            })
        else:
            return jsonify({'valid': False, 'error': 'Invalid token'}), 401
            
    except Exception as e:
        return jsonify({'error': 'Token verification failed'}), 500

@app.route('/api/status')
def api_status():
    """Enhanced API status endpoint"""
    return jsonify({
        'api_version': '2.0.0',
        'status': 'operational',
        'features': {
            'jwt_auth': True,
            'idor_vulnerabilities': True,
            'sql_injection': True,
            'admin_bypass': True
        },
        'endpoints': {
            'auth': {
                'login': '/api/auth/login',
                'verify': '/api/auth/verify'
            },
            'vulnerabilities': {
                'profile_idor': '/profile/<user_id>',
                'account_idor': '/account/<account_number>/transactions',
                'admin_bypass': '/admin/users?admin=true'
            },
            'banking': {
                'transfer': '/api/transfer',
                'pay_bill': '/api/pay-bill',
                'transactions': '/api/transactions',
                'apply_loan': '/api/apply-loan'
            },
            'traditional': {
                'login': '/login',
                'register': '/register',
                'dashboard': '/dashboard',
                'health': '/health'
            }
        }
    })

@app.route('/api/transfer', methods=['POST'])
def api_transfer():
    """Handle money transfers between accounts"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        to_account = data.get('toAccount', '').strip()
        amount = float(data.get('amount', 0))
        description = data.get('description', 'Transfer').strip()
        
        if not to_account or amount <= 0:
            return jsonify({'error': 'Invalid transfer details'}), 400
            
        if amount > 10000:
            return jsonify({'error': 'Daily transfer limit exceeded ($10,000)'}), 400
        
        conn = sqlite3.connect('razz_bank.db')
        cursor = conn.cursor()
        
        # Get sender's account info
        cursor.execute('SELECT account_number, balance FROM users WHERE id = ?', (session['user_id'],))
        sender = cursor.fetchone()
        
        if not sender:
            conn.close()
            return jsonify({'error': 'Account not found'}), 404
            
        if sender[1] < amount:
            conn.close()
            return jsonify({'error': 'Insufficient funds'}), 400
        
        # Check if recipient account exists
        cursor.execute('SELECT id FROM users WHERE account_number = ?', (to_account,))
        recipient = cursor.fetchone()
        
        if not recipient:
            conn.close()
            return jsonify({'error': 'Recipient account not found'}), 404
        
        # Update balances
        cursor.execute('UPDATE users SET balance = balance - ? WHERE id = ?', (amount, session['user_id']))
        cursor.execute('UPDATE users SET balance = balance + ? WHERE account_number = ?', (amount, to_account))
        
        # Record transaction
        cursor.execute('''
            INSERT INTO transactions (from_account, to_account, amount, description) 
            VALUES (?, ?, ?, ?)
        ''', (sender[0], to_account, amount, description))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Transfer completed successfully'})
        
    except Exception as e:
        return jsonify({'error': 'Transfer failed'}), 500

@app.route('/api/pay-bill', methods=['POST'])
def api_pay_bill():
    """Handle bill payments"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        payee = data.get('payee', '').strip()
        amount = float(data.get('amount', 0))
        pay_date = data.get('payDate', '')
        
        if not payee or amount <= 0:
            return jsonify({'error': 'Invalid bill payment details'}), 400
            
        conn = sqlite3.connect('razz_bank.db')
        cursor = conn.cursor()
        
        # Get user's account info
        cursor.execute('SELECT account_number, balance FROM users WHERE id = ?', (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'Account not found'}), 404
            
        if user[1] < amount:
            conn.close()
            return jsonify({'error': 'Insufficient funds'}), 400
        
        # Update balance
        cursor.execute('UPDATE users SET balance = balance - ? WHERE id = ?', (amount, session['user_id']))
        
        # Record bill payment transaction
        cursor.execute('''
            INSERT INTO transactions (from_account, to_account, amount, description) 
            VALUES (?, ?, ?, ?)
        ''', (user[0], payee.upper(), amount, f'Bill payment to {payee}'))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Bill payment scheduled successfully'})
        
    except Exception as e:
        return jsonify({'error': 'Bill payment failed'}), 500

@app.route('/api/transactions')
def api_transactions():
    """Get user's transaction history"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = sqlite3.connect('razz_bank.db')
        cursor = conn.cursor()
        
        # Get user's account number
        cursor.execute('SELECT account_number FROM users WHERE id = ?', (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'Account not found'}), 404
        
        account_number = user[0]
        
        # Get transactions for this account (simplified query)
        cursor.execute('''
            SELECT transaction_date, description, amount, from_account, to_account
            FROM transactions 
            WHERE from_account = ? OR to_account = ?
            ORDER BY transaction_date DESC 
            LIMIT 10
        ''', (account_number, account_number))
        
        transactions = cursor.fetchall()
        conn.close()
        
        # Format transactions for frontend
        formatted_transactions = []
        for txn in transactions:
            # Determine if this is credit or debit
            is_credit = txn[4] == account_number and txn[3] != account_number
            amount = txn[2] if is_credit else -txn[2]
            
            # Determine transaction type based on description
            description = txn[1].lower()
            if 'bill payment' in description:
                txn_type = 'bill_payment'
            elif 'transfer' in description:
                txn_type = 'transfer'
            elif 'deposit' in description or 'salary' in description:
                txn_type = 'deposit'
            elif 'withdrawal' in description or 'atm' in description:
                txn_type = 'withdrawal'
            else:
                txn_type = 'other'
            
            formatted_transactions.append({
                'date': txn[0].split(' ')[0] if ' ' in txn[0] else txn[0],
                'description': txn[1],
                'amount': amount,
                'type': txn_type
            })
        
        return jsonify({'transactions': formatted_transactions})
        
    except Exception as e:
        return jsonify({'error': 'Failed to load transactions'}), 500

@app.route('/api/apply-loan', methods=['POST'])
def api_apply_loan():
    """Handle loan applications"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        loan_amount = float(data.get('loanAmount', 0))
        loan_purpose = data.get('loanPurpose', '').strip()
        employment_status = data.get('employmentStatus', '').strip()
        annual_income = float(data.get('annualIncome', 0))
        
        if not all([loan_amount > 0, loan_purpose, employment_status, annual_income > 0]):
            return jsonify({'error': 'All fields are required'}), 400
            
        if loan_amount > 500000:
            return jsonify({'error': 'Loan amount exceeds maximum limit ($500,000)'}), 400
        
        conn = sqlite3.connect('razz_bank.db')
        cursor = conn.cursor()
        
        # Insert loan application
        cursor.execute('''
            INSERT INTO loan_applications (user_id, loan_amount, loan_purpose, employment_status, annual_income) 
            VALUES (?, ?, ?, ?, ?)
        ''', (session['user_id'], loan_amount, loan_purpose, employment_status, annual_income))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Loan application submitted successfully'})
        
    except Exception as e:
        return jsonify({'error': 'Loan application failed'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=False, host='0.0.0.0', port=5000)

# PWA Support Routes
@app.route('/sw.js')
def service_worker():
    return app.send_static_file('sw.js')

@app.route('/manifest.json')
def manifest():
    return app.send_static_file('manifest.json')
