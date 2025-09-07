#!/usr/bin/env python3
"""
Razz Bank SQL Injection Challenge
Educational CTF Challenge for Security Training
"""

from flask import Flask, render_template, request, session, redirect, url_for, jsonify, make_response
import sqlite3
import hashlib
import secrets
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

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

# Database initialization
def init_db():
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
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
    ''')
    
    # Create transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_account TEXT,
            to_account TEXT,
            amount DECIMAL(10,2),
            description TEXT,
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            transaction_type TEXT DEFAULT 'transfer'
        )
    ''')
    
    # Create loan applications table
    cursor.execute('''
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
    ''')
    
    # Create flags table (hidden)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_flags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            flag_name TEXT,
            flag_value TEXT,
            description TEXT
        )
    ''')
    
    # Insert the real flag
    cursor.execute('''
        INSERT OR REPLACE INTO system_flags (flag_name, flag_value, description) 
        VALUES ('admin_flag', 'RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}', 'Main challenge flag')
    ''')
    
    # Create admin user
    admin_password = hashlib.sha256('admin123!@#'.encode()).hexdigest()
    cursor.execute('''
        INSERT OR REPLACE INTO users (username, password, email, full_name, account_number, balance, role) 
        VALUES ('admin', ?, 'admin@razzbank.com', 'System Administrator', 'ADM001', 999999.99, 'admin')
    ''', (admin_password,))
    
    # Generate 87 regular users
    fake_users = []
    for i in range(1, 88):
        username = f'user{i:03d}'
        password = hashlib.sha256(f'password{i}'.encode()).hexdigest()
        email = f'user{i:03d}@razzbank.com'
        full_name = f'User {i:03d} LastName'
        account_number = f'RB{i:06d}'
        balance = round(1000 + (i * 123.45), 2)
        
        fake_users.append((username, password, email, full_name, account_number, balance, 'user'))
    
    cursor.executemany('''
        INSERT OR REPLACE INTO users (username, password, email, full_name, account_number, balance, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', fake_users)
    
    # Add some transactions
    sample_transactions = [
        ('RB000001', 'RB000002', 500.00, 'Payment for services'),
        ('RB000003', 'RB000001', 250.75, 'Refund transaction'),
        ('RB000002', 'RB000004', 1000.00, 'Loan payment'),
    ]
    
    cursor.executemany('''
        INSERT OR REPLACE INTO transactions (from_account, to_account, amount, description) 
        VALUES (?, ?, ?, ?)
    ''', sample_transactions)
    
    conn.commit()
    conn.close()

# Vulnerable login function (intentionally vulnerable for educational purposes)
def check_login(username, password):
    conn = sqlite3.connect('razz_bank.db')
    cursor = conn.cursor()
    
    # VULNERABLE SQL QUERY - This is intentionally vulnerable for the challenge
    # In production, this should NEVER be done!
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    
    try:
        cursor.execute(query)
        result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
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
            return redirect(url_for('dashboard'))
        else:
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

@app.route('/api/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        'api_version': '1.0.0',
        'status': 'operational',
        'endpoints': {
            'login': '/login',
            'register': '/register',
            'dashboard': '/dashboard',
            'health': '/health'
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
