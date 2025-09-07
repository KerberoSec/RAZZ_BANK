// Razz Bank - Main JavaScript Functions

class RazzBank {
    constructor() {
        this.init();
    }

    init() {
        // Initialize event listeners
        this.bindEvents();
        // Initialize security features
        this.initSecurity();
        // Initialize form validation
        this.initFormValidation();
        // Initialize dashboard features
        this.initDashboard();
    }

    bindEvents() {
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

        // Handle modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => this.closeModal(e));
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e);
            }
        });

        // Handle form submissions
        const transferForm = document.getElementById('transferForm');
        if (transferForm) {
            transferForm.addEventListener('submit', (e) => this.handleTransfer(e));
        }

        const billPayForm = document.getElementById('billPayForm');
        if (billPayForm) {
            billPayForm.addEventListener('submit', (e) => this.handleBillPayment(e));
        }

        const loanApplicationForm = document.getElementById('loanApplicationForm');
        if (loanApplicationForm) {
            loanApplicationForm.addEventListener('submit', (e) => this.handleLoanApplication(e));
        }

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
document.addEventListener('DOMContentLoaded', function() {
    window.razzBank = new RazzBank();
    
    // Add some additional UI enhancements
    addUIEnhancements();
});

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

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);