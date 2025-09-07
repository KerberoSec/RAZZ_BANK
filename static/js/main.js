// Razz Bank - Enhanced Main JavaScript Functions

class RazzBankAdvanced {
    constructor() {
        this.jwtToken = localStorage.getItem('razz_bank_jwt');
        this.theme = localStorage.getItem('theme') || 'light';
        this.apiEndpoints = {
            login: '/api/auth/login',
            verify: '/api/auth/verify',
            status: '/api/status',
            transfer: '/api/transfer',
            transactions: '/api/transactions',
            profile: '/profile',
            adminUsers: '/admin/users'
        };
        this.init();
    }

    init() {
        // Initialize theme
        this.initTheme();
        // Initialize event listeners
        this.bindEvents();
        // Initialize security features
        this.initSecurity();
        // Initialize form validation
        this.initFormValidation();
        // Initialize dashboard features
        this.initDashboard();
        // Initialize JWT authentication
        this.initJWTAuth();
        // Initialize API features
        this.initAPIFeatures();
        // Initialize modern UI enhancements
        this.initModernUI();
    }

    // Theme Management
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        // Update theme toggle text
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    // JWT Authentication
    initJWTAuth() {
        // Add JWT checkbox to login form
        const loginForm = document.querySelector('#loginForm');
        if (loginForm && !document.querySelector('#useJWT')) {
            const jwtOption = document.createElement('div');
            jwtOption.className = 'form-group';
            jwtOption.innerHTML = `
                <label>
                    <input type="checkbox" id="useJWT" name="use_jwt"> 
                    Use JWT Authentication
                </label>
            `;
            loginForm.insertBefore(jwtOption, loginForm.querySelector('button'));
        }

        // Verify existing JWT token
        if (this.jwtToken) {
            this.verifyToken();
        }
    }

    async loginWithJWT(username, password) {
        try {
            const response = await fetch(this.apiEndpoints.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success && data.token) {
                this.jwtToken = data.token;
                localStorage.setItem('razz_bank_jwt', this.jwtToken);
                this.showAlert('JWT Login successful!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
                
                return true;
            } else {
                this.showAlert(data.error || 'Login failed', 'danger');
                return false;
            }
        } catch (error) {
            this.showAlert('Network error during JWT login', 'danger');
            return false;
        }
    }

    async verifyToken() {
        if (!this.jwtToken) return false;

        try {
            const response = await fetch(this.apiEndpoints.verify, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: this.jwtToken })
            });

            const data = await response.json();
            
            if (!data.valid) {
                localStorage.removeItem('razz_bank_jwt');
                this.jwtToken = null;
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    // API Request Helper with JWT
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.jwtToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.jwtToken}`;
        }

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(endpoint, finalOptions);
            const data = await response.json();
            
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('razz_bank_jwt');
                this.jwtToken = null;
                this.showAlert('Session expired. Please login again.', 'warning');
            }
            
            return { response, data };
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // IDOR Vulnerability Demonstration
    async demonstrateIDOR() {
        const userIdInput = prompt('Enter user ID to view profile (IDOR vulnerability):');
        if (!userIdInput) return;

        try {
            const response = await fetch(`/profile/${userIdInput}`);
            const data = await response.json();
            
            if (response.ok) {
                this.showAlert(`IDOR Success! Viewing user: ${data.full_name} (ID: ${data.id})`, 'warning');
                console.log('IDOR Data:', data);
                
                // Show in modal
                this.showIDORModal(data);
            } else {
                this.showAlert(data.error || 'User not found', 'danger');
            }
        } catch (error) {
            this.showAlert('IDOR demonstration failed', 'danger');
        }
    }

    showIDORModal(userData) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>🚨 IDOR Vulnerability Exploited</h3>
                <div class="warning">
                    <strong>Security Warning:</strong> This demonstrates an IDOR vulnerability where you can access any user's data without proper authorization.
                </div>
                <div class="user-data">
                    <h4>Exposed User Data:</h4>
                    <p><strong>ID:</strong> ${userData.id}</p>
                    <p><strong>Username:</strong> ${userData.username}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Full Name:</strong> ${userData.full_name}</p>
                    <p><strong>Account Number:</strong> ${userData.account_number}</p>
                    <p><strong>Balance:</strong> $${userData.balance}</p>
                    <p><strong>Role:</strong> ${userData.role}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Admin Bypass Demonstration
    async demonstrateAdminBypass() {
        try {
            const response = await fetch('/admin/users?admin=true');
            const data = await response.json();
            
            if (response.ok) {
                this.showAlert(`Admin Bypass Success! Retrieved ${data.users.length} user records`, 'warning');
                console.log('Admin Bypass Data:', data);
                
                // Show in modal
                this.showAdminBypassModal(data.users);
            } else {
                this.showAlert(data.error || 'Admin bypass failed', 'danger');
            }
        } catch (error) {
            this.showAlert('Admin bypass demonstration failed', 'danger');
        }
    }

    showAdminBypassModal(users) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close">&times;</span>
                <h3>🚨 Admin Authorization Bypass</h3>
                <div class="warning">
                    <strong>Security Warning:</strong> This demonstrates an authorization bypass where admin access is granted through URL parameters.
                </div>
                <div class="admin-data">
                    <h4>Exposed Admin Data (${users.length} users):</h4>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table class="transaction-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Balance</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.slice(0, 20).map(user => `
                                    <tr>
                                        <td>${user.id}</td>
                                        <td>${user.username}</td>
                                        <td>${user.email}</td>
                                        <td>$${user.balance}</td>
                                        <td>${user.role}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${users.length > 20 ? `<p><em>... and ${users.length - 20} more users</em></p>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Modern UI Enhancements
    initModernUI() {
        // Add loading states to buttons
        this.enhanceButtons();
        
        // Add animation to cards
        this.animateCards();
        
        // Add notification system
        this.initNotifications();
        
        // Add progressive web app features
        this.initPWA();
    }

    enhanceButtons() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Add ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    animateCards() {
        // Intersection Observer for card animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        document.querySelectorAll('.card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    }

    initNotifications() {
        // Create notification container
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: var(--card-bg);
            border-left: 4px solid var(--${type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'info'}-color);
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: var(--card-shadow);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, duration);
    }

    initPWA() {
        // Check if service worker is supported
        if ('serviceWorker' in navigator) {
            // Register service worker for offline functionality
            navigator.serviceWorker.register('/sw.js')
                .then(() => {
                    console.log('Service Worker registered');
                })
                .catch(() => {
                    console.log('Service Worker registration failed');
                });
        }
    }

    bindEvents() {
        // Enhanced form handling with JWT support
        const loginForm = document.querySelector('#loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                const useJWT = document.querySelector('#useJWT')?.checked;
                if (useJWT) {
                    e.preventDefault();
                    const username = loginForm.querySelector('input[name="username"]').value;
                    const password = loginForm.querySelector('input[name="password"]').value;
                    await this.loginWithJWT(username, password);
                }
            });
        }

        // Handle transfer modal
        const transferBtn = document.querySelector('.transfer-btn');
        if (transferBtn) {
            transferBtn.addEventListener('click', () => this.showTransferModal());
        }

        // Handle bill payment modal
        const billPayBtn = document.querySelector('.bill-pay-btn');
        if (billPayBtn) {
            billPayBtn.addEventListener('click', () => this.showBillPayModal());
        }

        // Handle loan application modal
        const loanApplyBtn = document.querySelector('.loan-apply-btn');
        if (loanApplyBtn) {
            loanApplyBtn.addEventListener('click', () => this.showLoanApplicationModal());
        }

        // IDOR Demonstration buttons
        const idorBtn = document.querySelector('.idor-demo-btn');
        if (idorBtn) {
            idorBtn.addEventListener('click', () => this.demonstrateIDOR());
        }

        // Admin bypass demonstration
        const adminBypassBtn = document.querySelector('.admin-bypass-btn');
        if (adminBypassBtn) {
            adminBypassBtn.addEventListener('click', () => this.demonstrateAdminBypass());
        }

        // Handle modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                this.closeModal(e);
            }
            if (e.target.classList.contains('modal')) {
                this.closeModal(e);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    initAPIFeatures() {
        // Add vulnerability demonstration panel
        this.createVulnerabilityPanel();
        
        // Add API testing interface
        this.createAPITestInterface();
    }

    createVulnerabilityPanel() {
        const dashboard = document.querySelector('.dashboard-grid');
        if (!dashboard || document.querySelector('.vulnerability-panel')) return;

        const panel = document.createElement('div');
        panel.className = 'card vulnerability-panel glass-card';
        panel.innerHTML = `
            <h3>🔓 Vulnerability Demonstrations</h3>
            <p class="warning">Educational demonstrations of common web vulnerabilities</p>
            <div class="vulnerability-buttons">
                <button class="btn btn-danger btn-outline idor-demo-btn">
                    <span>🎯</span> Test IDOR Vulnerability
                </button>
                <button class="btn btn-warning btn-outline admin-bypass-btn">
                    <span>🔑</span> Admin Authorization Bypass
                </button>
                <button class="btn btn-info btn-outline sql-demo-btn">
                    <span>💉</span> SQL Injection (Login)
                </button>
                <button class="btn btn-secondary btn-outline jwt-demo-btn">
                    <span>🔐</span> JWT Token Analysis
                </button>
            </div>
            <div class="vulnerability-info">
                <small>
                    <strong>Note:</strong> These vulnerabilities are intentionally implemented for educational purposes.
                    Never deploy this application in production environments.
                </small>
            </div>
        `;

        dashboard.appendChild(panel);

        // Bind new events
        panel.querySelector('.idor-demo-btn').addEventListener('click', () => this.demonstrateIDOR());
        panel.querySelector('.admin-bypass-btn').addEventListener('click', () => this.demonstrateAdminBypass());
        panel.querySelector('.sql-demo-btn').addEventListener('click', () => this.demonstrateSQL());
        panel.querySelector('.jwt-demo-btn').addEventListener('click', () => this.demonstrateJWT());
    }

    demonstrateSQL() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>💉 SQL Injection Demonstration</h3>
                <div class="warning">
                    <strong>Vulnerability:</strong> The login form is vulnerable to SQL injection attacks.
                </div>
                <div class="sql-demo">
                    <h4>Try these payloads in the login form:</h4>
                    <div class="code-block">
                        <h5>Authentication Bypass:</h5>
                        <code>Username: admin' OR '1'='1' --</code><br>
                        <code>Password: anything</code>
                    </div>
                    <div class="code-block">
                        <h5>Data Extraction:</h5>
                        <code>Username: admin' UNION SELECT 1,2,3,flag_value,5,6,7,8 FROM system_flags--</code><br>
                        <code>Password: anything</code>
                    </div>
                    <p><strong>Flag Location:</strong> system_flags table contains the real flag</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    demonstrateJWT() {
        if (!this.jwtToken) {
            this.showAlert('No JWT token available. Login with JWT option first.', 'warning');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>🔐 JWT Token Analysis</h3>
                <div class="warning">
                    <strong>Security Issue:</strong> JWT tokens are using a weak secret key.
                </div>
                <div class="jwt-demo">
                    <h4>Current JWT Token:</h4>
                    <div class="code-block">
                        <code style="word-break: break-all;">${this.jwtToken}</code>
                    </div>
                    <h4>Decoded Payload:</h4>
                    <div class="code-block">
                        <pre>${JSON.stringify(this.decodeJWT(this.jwtToken), null, 2)}</pre>
                    </div>
                    <h4>Vulnerability Details:</h4>
                    <ul>
                        <li>Weak secret key: "weak_secret_key_2024"</li>
                        <li>No proper key rotation</li>
                        <li>Stored in localStorage (XSS vulnerability)</li>
                        <li>No additional security claims</li>
                    </ul>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return { error: 'Invalid token' };
        }
    }

    createAPITestInterface() {
        const container = document.querySelector('.container');
        if (!container || document.querySelector('.api-test-interface')) return;

        const apiInterface = document.createElement('div');
        apiInterface.className = 'card api-test-interface gradient-border';
        apiInterface.innerHTML = `
            <h3>🔧 API Testing Interface</h3>
            <div class="api-form">
                <div class="form-group">
                    <label for="apiEndpoint">Endpoint:</label>
                    <select id="apiEndpoint" class="form-control">
                        <option value="/api/status">GET /api/status</option>
                        <option value="/api/transactions">GET /api/transactions</option>
                        <option value="/profile/1">GET /profile/1 (IDOR)</option>
                        <option value="/admin/users?admin=true">GET /admin/users?admin=true</option>
                        <option value="/account/RB000001/transactions">GET /account/RB000001/transactions</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="useJWTHeader"> Use JWT Authorization Header
                    </label>
                </div>
                <button class="btn btn-primary" id="testAPIBtn">Test API Endpoint</button>
                <div id="apiResponse" class="api-response" style="display: none;">
                    <h4>Response:</h4>
                    <pre></pre>
                </div>
            </div>
        `;

        container.appendChild(apiInterface);

        // Bind API test functionality
        document.getElementById('testAPIBtn').addEventListener('click', () => this.testAPIEndpoint());
    }

    async testAPIEndpoint() {
        const endpoint = document.getElementById('apiEndpoint').value;
        const useJWT = document.getElementById('useJWTHeader').checked;
        const responseDiv = document.getElementById('apiResponse');
        const responsePre = responseDiv.querySelector('pre');

        try {
            const options = {
                method: 'GET',
                headers: {}
            };

            if (useJWT && this.jwtToken) {
                options.headers['Authorization'] = `Bearer ${this.jwtToken}`;
            }

            const response = await fetch(endpoint, options);
            const data = await response.json();

            responsePre.textContent = JSON.stringify({
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers),
                body: data
            }, null, 2);

            responseDiv.style.display = 'block';
        } catch (error) {
            responsePre.textContent = `Error: ${error.message}`;
            responseDiv.style.display = 'block';
        }
    }
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'transferForm') {
                this.handleTransfer(e);
            } else if (e.target.id === 'billPayForm') {
                this.handleBillPayment(e);
            } else if (e.target.id === 'loanApplicationForm') {
                this.handleLoanApplication(e);
            }
        });

        // Auto-logout feature
        this.initAutoLogout();
    }

    initSecurity() {
        // Session timeout warning
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
        
        if (this.isLoggedIn()) {
            this.startSessionTimer();
        }

        // Prevent right-click in production (security theater)
        if (window.location.hostname !== 'localhost') {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showAlert('Right-click disabled for security', 'warning');
            });
        }

        // Clear sensitive data on page unload
        window.addEventListener('beforeunload', () => {
            this.clearSensitiveData();
        });
    }

    initFormValidation() {
        // Real-time password strength validation
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.addEventListener('input', (e) => this.validatePassword(e.target.value));
        }

        // Account number formatting
        const accountFields = document.querySelectorAll('.account-number-input');
        accountFields.forEach(field => {
            field.addEventListener('input', (e) => this.formatAccountNumber(e.target));
        });

        // Amount input validation
        const amountFields = document.querySelectorAll('.amount-input');
        amountFields.forEach(field => {
            field.addEventListener('input', (e) => this.validateAmount(e.target));
        });
    }

    initDashboard() {
        if (this.isLoggedIn()) {
            this.updateLastActivity();
            this.loadRecentTransactions();
            this.updateAccountInfo();
        }
    }

    showTransferModal() {
        const modal = document.getElementById('transferModal') || this.createTransferModal();
        modal.style.display = 'block';
        
        // Focus on first input for accessibility
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    createTransferModal() {
        const modalHtml = `
            <div id="transferModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Transfer Money</h2>
                    <form id="transferForm">
                        <div class="form-group">
                            <label for="toAccount">To Account Number:</label>
                            <input type="text" id="toAccount" name="toAccount" class="form-control account-number-input" required>
                        </div>
                        <div class="form-group">
                            <label for="amount">Amount ($):</label>
                            <input type="number" id="amount" name="amount" class="form-control amount-input" step="0.01" min="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description (Optional):</label>
                            <input type="text" id="description" name="description" class="form-control" maxlength="100">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Transfer Money</button>
                            <button type="button" class="btn btn-secondary" onclick="razzBank.closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return document.getElementById('transferModal');
    }

    showBillPayModal() {
        const modal = document.getElementById('billPayModal') || this.createBillPayModal();
        modal.style.display = 'block';
    }

    createBillPayModal() {
        const modalHtml = `
            <div id="billPayModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Pay Bills</h2>
                    <form id="billPayForm">
                        <div class="form-group">
                            <label for="payee">Payee:</label>
                            <select id="payee" name="payee" class="form-control" required>
                                <option value="">Select Payee</option>
                                <option value="electric">Electric Company</option>
                                <option value="water">Water Utility</option>
                                <option value="internet">Internet Provider</option>
                                <option value="credit-card">Credit Card</option>
                                <option value="mortgage">Mortgage Company</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="billAmount">Amount ($):</label>
                            <input type="number" id="billAmount" name="billAmount" class="form-control amount-input" step="0.01" min="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="payDate">Pay Date:</label>
                            <input type="date" id="payDate" name="payDate" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Schedule Payment</button>
                            <button type="button" class="btn btn-secondary" onclick="razzBank.closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return document.getElementById('billPayModal');
    }

    showLoanApplicationModal() {
        const modal = document.getElementById('loanApplicationModal') || this.createLoanApplicationModal();
        modal.style.display = 'block';
    }

    createLoanApplicationModal() {
        const modalHtml = `
            <div id="loanApplicationModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Apply for Loan</h2>
                    <form id="loanApplicationForm">
                        <div class="form-group">
                            <label for="loanAmount">Loan Amount ($):</label>
                            <input type="number" id="loanAmount" name="loanAmount" class="form-control amount-input" step="0.01" min="1000" max="500000" required>
                            <small>Minimum: $1,000 | Maximum: $500,000</small>
                        </div>
                        <div class="form-group">
                            <label for="loanPurpose">Loan Purpose:</label>
                            <select id="loanPurpose" name="loanPurpose" class="form-control" required>
                                <option value="">Select Purpose</option>
                                <option value="home-purchase">Home Purchase</option>
                                <option value="home-improvement">Home Improvement</option>
                                <option value="debt-consolidation">Debt Consolidation</option>
                                <option value="business">Business Investment</option>
                                <option value="education">Education</option>
                                <option value="medical">Medical Expenses</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="employmentStatus">Employment Status:</label>
                            <select id="employmentStatus" name="employmentStatus" class="form-control" required>
                                <option value="">Select Status</option>
                                <option value="full-time">Full-time Employee</option>
                                <option value="part-time">Part-time Employee</option>
                                <option value="self-employed">Self-employed</option>
                                <option value="contract">Contract Worker</option>
                                <option value="unemployed">Unemployed</option>
                                <option value="retired">Retired</option>
                                <option value="student">Student</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="annualIncome">Annual Income ($):</label>
                            <input type="number" id="annualIncome" name="annualIncome" class="form-control" min="0" step="1000" required>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Submit Application</button>
                            <button type="button" class="btn btn-secondary" onclick="razzBank.closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return document.getElementById('loanApplicationModal');
    }

    closeModal(e) {
        const modal = e ? e.target.closest('.modal') : document.querySelector('.modal[style*="block"]');
        if (modal) {
            modal.style.display = 'none';
            
            // Clear form data for security
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
        }
    }

    handleTransfer(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const transferData = {
            toAccount: formData.get('toAccount'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description') || 'Transfer'
        };

        // Validate transfer
        if (!this.validateTransfer(transferData)) {
            return;
        }

        // Show loading state
        this.showLoading('Processing transfer...');

        // Make actual API call
        fetch('/api/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transferData)
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            if (data.success) {
                this.showAlert(data.message, 'success');
                this.closeModal();
                this.updateAccountInfo();
                this.loadRecentTransactions();
            } else {
                this.showAlert(data.error || 'Transfer failed', 'danger');
            }
        })
        .catch(error => {
            this.hideLoading();
            this.showAlert('Transfer failed: Network error', 'danger');
        });
    }

    handleBillPayment(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const billData = {
            payee: formData.get('payee'),
            amount: parseFloat(formData.get('billAmount')),
            payDate: formData.get('payDate')
        };

        if (!billData.payee || billData.amount <= 0 || !billData.payDate) {
            this.showAlert('Please fill in all required fields', 'danger');
            return;
        }

        // Show loading state
        this.showLoading('Processing bill payment...');

        // Make actual API call
        fetch('/api/pay-bill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(billData)
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            if (data.success) {
                this.showAlert(data.message, 'success');
                this.closeModal();
                this.updateAccountInfo();
                this.loadRecentTransactions();
            } else {
                this.showAlert(data.error || 'Bill payment failed', 'danger');
            }
        })
        .catch(error => {
            this.hideLoading();
            this.showAlert('Bill payment failed: Network error', 'danger');
        });
    }

    handleLoanApplication(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loanData = {
            loanAmount: parseFloat(formData.get('loanAmount')),
            loanPurpose: formData.get('loanPurpose'),
            employmentStatus: formData.get('employmentStatus'),
            annualIncome: parseFloat(formData.get('annualIncome'))
        };

        if (!loanData.loanAmount || !loanData.loanPurpose || !loanData.employmentStatus || !loanData.annualIncome) {
            this.showAlert('Please fill in all required fields', 'danger');
            return;
        }

        // Show loading state
        this.showLoading('Submitting loan application...');

        // Make actual API call
        fetch('/api/apply-loan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loanData)
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            if (data.success) {
                this.showAlert(data.message, 'success');
                this.closeModal();
            } else {
                this.showAlert(data.error || 'Loan application failed', 'danger');
            }
        })
        .catch(error => {
            this.hideLoading();
            this.showAlert('Loan application failed: Network error', 'danger');
        });
    }

    validateTransfer(data) {
        if (!data.toAccount || data.toAccount.length < 6) {
            this.showAlert('Please enter a valid account number', 'danger');
            return false;
        }

        if (data.amount <= 0) {
            this.showAlert('Transfer amount must be greater than $0', 'danger');
            return false;
        }

        if (data.amount > 10000) {
            this.showAlert('Daily transfer limit is $10,000', 'warning');
            return false;
        }

        return true;
    }

    validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const strength = Object.values(requirements).filter(Boolean).length;
        const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
        const strengthColor = ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0d6efd'][strength];

        // Update password strength indicator if it exists
        const indicator = document.getElementById('passwordStrength');
        if (indicator) {
            indicator.textContent = `Password Strength: ${strengthText}`;
            indicator.style.color = strengthColor;
        }

        return strength >= 3;
    }

    formatAccountNumber(input) {
        let value = input.value.replace(/\D/g, ''); // Remove non-digits
        value = value.substring(0, 10); // Limit to 10 digits
        
        // Format as XX-XXXX-XXXX
        if (value.length > 6) {
            value = value.substring(0, 2) + '-' + value.substring(2, 6) + '-' + value.substring(6);
        } else if (value.length > 2) {
            value = value.substring(0, 2) + '-' + value.substring(2);
        }
        
        input.value = value;
    }

    validateAmount(input) {
        const value = parseFloat(input.value);
        const max = parseFloat(input.getAttribute('max')) || 999999;
        
        if (value < 0) {
            input.value = '';
            this.showAlert('Amount cannot be negative', 'warning');
        } else if (value > max) {
            input.value = max;
            this.showAlert(`Maximum amount is $${max.toLocaleString()}`, 'warning');
        }
    }

    startSessionTimer() {
        // Clear any existing timer
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        // Set warning timer
        this.sessionTimer = setTimeout(() => {
            this.showSessionWarning();
        }, this.sessionTimeout - this.warningTime);
    }

    showSessionWarning() {
        const extend = confirm('Your session will expire in 5 minutes. Do you want to extend it?');
        if (extend) {
            this.extendSession();
        } else {
            setTimeout(() => this.logout(), this.warningTime);
        }
    }

    extendSession() {
        // In a real app, this would make an API call to extend the session
        this.startSessionTimer();
        this.showAlert('Session extended', 'success');
    }

    initAutoLogout() {
        let lastActivity = Date.now();
        
        const updateActivity = () => {
            lastActivity = Date.now();
        };

        // Track user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });

        // Check for inactivity every minute
        setInterval(() => {
            if (Date.now() - lastActivity > this.sessionTimeout && this.isLoggedIn()) {
                this.logout();
            }
        }, 60000);
    }

    logout() {
        this.clearSensitiveData();
        window.location.href = '/logout';
    }

    clearSensitiveData() {
        // Clear any sensitive data from memory/DOM
        document.querySelectorAll('.sensitive-data').forEach(el => {
            el.textContent = '';
        });
        
        // Clear form fields
        document.querySelectorAll('input[type="password"], .amount-input').forEach(input => {
            input.value = '';
        });
    }

    isLoggedIn() {
        return document.body.dataset.userLoggedIn === 'true' || 
               document.querySelector('.navbar .logout') !== null;
    }

    updateLastActivity() {
        const activityElement = document.getElementById('lastActivity');
        if (activityElement) {
            activityElement.textContent = new Date().toLocaleString();
        }
    }

    loadRecentTransactions() {
        const transactionContainer = document.getElementById('recentTransactions');
        if (!transactionContainer) return;

        // Show loading state
        this.showLoading('Loading transactions...', transactionContainer);

        // Load real transactions from API
        fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            if (data.transactions) {
                this.renderTransactions(data.transactions, transactionContainer);
            } else {
                transactionContainer.innerHTML = '<p style="color: #666; text-align: center;">No transactions found</p>';
            }
        })
        .catch(error => {
            console.error('Error loading transactions:', error);
            // Fallback to mock data if API fails
            const mockTransactions = [
                { date: '2025-01-06', description: 'Online Purchase', amount: -45.99, type: 'purchase' },
                { date: '2025-01-05', description: 'Salary Deposit', amount: 2500.00, type: 'deposit' },
                { date: '2025-01-04', description: 'Transfer to John', amount: -150.00, type: 'transfer' },
                { date: '2025-01-03', description: 'ATM Withdrawal', amount: -100.00, type: 'withdrawal' }
            ];
            this.renderTransactions(mockTransactions, transactionContainer);
        });
    }

    renderTransactions(transactions, container) {
        if (!transactions || transactions.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No recent transactions</p>';
            return;
        }

        const tableHtml = `
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.date}</td>
                            <td>${t.description}</td>
                            <td class="transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}">
                                ${t.amount > 0 ? '+' : ''}$${Math.abs(t.amount).toFixed(2)}
                            </td>
                            <td>${this.formatTransactionType(t.type)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = tableHtml;
    }

    formatTransactionType(type) {
        const typeMap = {
            'transfer': 'Transfer',
            'bill_payment': 'Bill Payment',
            'deposit': 'Deposit',
            'withdrawal': 'Withdrawal',
            'purchase': 'Purchase'
        };
        return typeMap[type] || type;
    }

    updateAccountInfo() {
        // Simulate updating account information
        const balanceElement = document.querySelector('.balance-amount');
        if (balanceElement) {
            // Add subtle animation to balance updates
            balanceElement.style.transition = 'all 0.3s ease';
            balanceElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                balanceElement.style.transform = 'scale(1)';
            }, 300);
        }
    }

    showAlert(message, type = 'info') {
        const alertHtml = `
            <div class="alert alert-${type}" style="position: fixed; top: 20px; right: 20px; z-index: 2000; min-width: 300px;">
                ${message}
                <button type="button" class="close" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHtml);
        
        const alert = document.body.lastElementChild;
        const closeBtn = alert.querySelector('.close');
        
        closeBtn.addEventListener('click', () => alert.remove());
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    showLoading(message = 'Loading...', container = null) {
        const loadingHtml = `
            <div class="loading-container" style="text-align: center; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        if (container) {
            container.innerHTML = loadingHtml;
        } else {
            // Show full-page loading
            document.body.insertAdjacentHTML('beforeend', `
                <div id="pageLoading" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); z-index: 3000; display: flex; align-items: center; justify-content: center;">
                    ${loadingHtml}
                </div>
            `);
        }
    }

    hideLoading() {
        const pageLoading = document.getElementById('pageLoading');
        if (pageLoading) {
            pageLoading.remove();
        }
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Security method to detect potential injection attempts
    detectSQLInjection(input) {
        const sqlPatterns = [
            /(\bor\b|\band\b).+(\=|\blike\b)/i,
            /union\s+select/i,
            /insert\s+into/i,
            /delete\s+from/i,
            /update\s+.+\s+set/i,
            /drop\s+(table|database)/i,
            /script\s*>/i,
            /<\s*script/i
        ];
        
        return sqlPatterns.some(pattern => pattern.test(input));
    }
}

// Initialize the RazzBank application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.razzBank = new RazzBank();
    addUIEnhancements();
});

// Add CSS classes for alerts if they don't exist
if (!document.querySelector('style[data-razzbank-alerts]')) {
    const alertStyles = document.createElement('style');
    alertStyles.setAttribute('data-razzbank-alerts', 'true');
    alertStyles.textContent = `
        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid transparent;
            border-radius: 4px;
        }
        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }
        .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }
        .alert-warning {
            color: #856404;
            background-color: #fff3cd;
            border-color: #ffeaa7;
        }
        .alert-info {
            color: #0c5460;
            background-color: #d1ecf1;
            border-color: #bee5eb;
        }
        .transaction-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        .transaction-table th,
        .transaction-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .transaction-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .transaction-amount.positive {
            color: #28a745;
        }
        .transaction-amount.negative {
            color: #dc3545;
        }
    `;
    document.head.appendChild(alertStyles);
}

// Add UI enhancements
function addUIEnhancements() {
    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

    // Remaining methods from original class
    initSecurity() {
        // Session timeout monitoring
        this.startSessionTimer();
        
        // Auto-logout on inactivity
        this.initAutoLogout();
        
        // Clear sensitive data on page unload
        window.addEventListener('beforeunload', () => this.clearSensitiveData());
        
        // Detect potential SQL injection in forms
        document.addEventListener('input', (e) => {
            if (e.target.type === 'text' || e.target.type === 'email') {
                if (this.detectSQLInjection(e.target.value)) {
                    e.target.style.borderColor = '#dc3545';
                    this.showAlert('Potential SQL injection detected!', 'warning');
                } else {
                    e.target.style.borderColor = '';
                }
            }
        });
    }

    initFormValidation() {
        // Real-time password strength validation
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.addEventListener('input', (e) => this.validatePassword(e.target.value));
        }

        // Account number formatting
        const accountFields = document.querySelectorAll('.account-number-input');
        accountFields.forEach(field => {
            field.addEventListener('input', (e) => this.formatAccountNumber(e.target));
        });

        // Amount input validation
        const amountFields = document.querySelectorAll('.amount-input');
        amountFields.forEach(field => {
            field.addEventListener('input', (e) => this.validateAmount(e.target));
        });
    }

    initDashboard() {
        if (this.isLoggedIn()) {
            this.updateLastActivity();
            this.loadRecentTransactions();
            this.updateAccountInfo();
        }
    }

    // Helper methods
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alert, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 5000);
        
        // Also show as notification
        this.showNotification(message, type);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    closeModal(e) {
        const modal = e ? e.target.closest('.modal') : document.querySelector('.modal[style*="block"]');
        if (modal) {
            modal.style.display = 'none';
            
            // Clear form data for security
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
        }
    }

    showLoading(message = 'Loading...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    isLoggedIn() {
        return sessionStorage.getItem('user_id') || this.jwtToken;
    }

    startSessionTimer() {
        // Implementation for session monitoring
    }

    initAutoLogout() {
        // Implementation for auto-logout
    }

    clearSensitiveData() {
        // Clear any sensitive data from memory
        this.jwtToken = null;
    }

    updateLastActivity() {
        localStorage.setItem('lastActivity', Date.now().toString());
    }

    loadRecentTransactions() {
        // Load and display recent transactions
    }

    updateAccountInfo() {
        // Update account information display
    }

    validatePassword(password) {
        // Password strength validation
        const strength = this.calculatePasswordStrength(password);
        // Update UI with strength indicator
    }

    calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return score;
    }

    formatAccountNumber(input) {
        // Format account number input
        let value = input.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = 'RB' + value.substring(0, 6);
        }
        input.value = value;
    }

    validateAmount(input) {
        // Validate monetary amounts
        const value = parseFloat(input.value);
        if (isNaN(value) || value <= 0) {
            input.setCustomValidity('Please enter a valid amount');
        } else {
            input.setCustomValidity('');
        }
    }

    detectSQLInjection(input) {
        const sqlPatterns = [
            /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
            /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
            /((\%27)|(\'))union/i,
            /exec(\s|\+)+(s|x)p\w+/i,
            /union[^a-z]*select/i,
            /insert[^a-z]*into/i,
            /delete[^a-z]*from/i,
            /update[^a-z]*set/i,
            /drop[^a-z]*(table|database)/i
        ];
        
        return sqlPatterns.some(pattern => pattern.test(input));
    }

    // Modal creation methods (simplified versions)
    showTransferModal() {
        this.createModal('transfer', 'Transfer Money', `
            <form id="transferForm">
                <div class="form-group">
                    <label for="toAccount">To Account:</label>
                    <input type="text" id="toAccount" name="toAccount" class="form-control account-number-input" required>
                </div>
                <div class="form-group">
                    <label for="amount">Amount:</label>
                    <input type="number" id="amount" name="amount" class="form-control amount-input" step="0.01" min="1" required>
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <input type="text" id="description" name="description" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">Transfer</button>
            </form>
        `);
    }

    showBillPayModal() {
        this.createModal('billPay', 'Pay Bill', `
            <form id="billPayForm">
                <div class="form-group">
                    <label for="payee">Payee:</label>
                    <input type="text" id="payee" name="payee" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="billAmount">Amount:</label>
                    <input type="number" id="billAmount" name="amount" class="form-control amount-input" step="0.01" min="1" required>
                </div>
                <button type="submit" class="btn btn-primary">Pay Bill</button>
            </form>
        `);
    }

    showLoanApplicationModal() {
        this.createModal('loanApplication', 'Apply for Loan', `
            <form id="loanApplicationForm">
                <div class="form-group">
                    <label for="loanAmount">Loan Amount:</label>
                    <input type="number" id="loanAmount" name="loanAmount" class="form-control" step="1000" min="1000" required>
                </div>
                <div class="form-group">
                    <label for="loanPurpose">Purpose:</label>
                    <select id="loanPurpose" name="loanPurpose" class="form-control" required>
                        <option value="">Select purpose</option>
                        <option value="home">Home Purchase</option>
                        <option value="car">Car Purchase</option>
                        <option value="education">Education</option>
                        <option value="business">Business</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Apply</button>
            </form>
        `);
    }

    createModal(id, title, content) {
        // Remove existing modal
        const existing = document.getElementById(`${id}Modal`);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = `${id}Modal`;
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
}

// Add CSS for new components
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .vulnerability-panel {
        margin-top: 2rem;
    }
    
    .vulnerability-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
    }
    
    .vulnerability-info {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(255, 193, 7, 0.1);
        border-radius: 8px;
        border-left: 4px solid var(--warning-color);
    }
    
    .code-block {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin: 0.5rem 0;
        border-left: 4px solid #007bff;
    }
    
    .code-block code {
        background: none;
        padding: 0;
        color: #d63384;
        font-weight: bold;
    }
    
    .api-response {
        margin-top: 1rem;
        max-height: 400px;
        overflow-y: auto;
    }
    
    .api-response pre {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
    }
    
    .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
`;
document.head.appendChild(enhancedStyles);

// Initialize the enhanced Razz Bank application
document.addEventListener('DOMContentLoaded', () => {
    window.razzBank = new RazzBankAdvanced();
    
    // Add theme toggle to navigation if it doesn't exist
    const nav = document.querySelector('.nav-links');
    if (nav && !document.querySelector('.theme-toggle')) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.textContent = '🌙';
        themeToggle.title = 'Toggle theme';
        nav.appendChild(themeToggle);
    }
});