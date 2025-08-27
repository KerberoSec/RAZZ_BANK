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
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

if __name__ == '__main__':
    init_db()
    app.run(debug=False, host='0.0.0.0', port=5000)
