"""
Account service for RAZZ Bank application.
Handles account-related business logic and data operations.
"""

from .base_service import BaseService


class AccountService(BaseService):
    """Service class for account-related operations."""
    
    def get_account_by_number(self, account_number):
        """
        Get account details by account number.
        
        VULNERABLE: No authorization check - IDOR vulnerability for educational purposes.
        This allows access to any account's details without proper authorization.
        """
        query = '''
            SELECT id, username, email, full_name, account_number, balance, role, created_at
            FROM users 
            WHERE account_number = ?
        '''
        
        result = self.execute_query(query, (account_number,), fetch='one')
        
        if result:
            # Check if this is a special account that should return a flag
            flag_data = self._check_for_flag(account_number)
            
            account_data = {
                'id': result[0],
                'username': result[1],
                'email': result[2],
                'full_name': result[3],
                'account_number': result[4],
                'balance': float(result[5]),
                'role': result[6],
                'created_at': result[7]
            }
            
            # Add flag if applicable
            if flag_data:
                account_data['system_message'] = flag_data
            
            return account_data
        
        return None
    
    def _check_for_flag(self, account_number):
        """
        Check if account access should reveal a flag.
        Educational purpose: demonstrating information disclosure.
        """
        # Special flag for admin account access
        if account_number == 'ADM001':
            flag_query = '''
                SELECT flag_value, description 
                FROM system_flags 
                WHERE flag_name = ?
            '''
            
            flag_result = self.execute_query(flag_query, ('admin_flag',), fetch='one')
            
            if flag_result:
                return {
                    'type': 'security_alert',
                    'message': 'IDOR vulnerability detected: Unauthorized admin account access',
                    'flag': flag_result[0],
                    'description': flag_result[1]
                }
        
        # Special handling for certain account patterns
        if account_number.startswith('RB') and account_number.endswith('001'):
            return {
                'type': 'info',
                'message': 'Special account detected: Enhanced privileges may apply',
                'hint': 'Try accessing administrative accounts for more information'
            }
        
        return None
    
    def get_account_transactions(self, account_number, limit=10):
        """
        Get transaction history for an account.
        
        VULNERABLE: No authorization check - IDOR vulnerability.
        """
        query = '''
            SELECT transaction_date, description, amount, from_account, to_account
            FROM transactions 
            WHERE from_account = ? OR to_account = ?
            ORDER BY transaction_date DESC 
            LIMIT ?
        '''
        
        results = self.execute_query(query, (account_number, account_number, limit), fetch='all')
        
        if results:
            transactions = []
            for txn in results:
                # Determine if transaction is credit or debit
                is_credit = txn[4] == account_number and txn[3] != account_number
                amount = txn[2] if is_credit else -txn[2]
                
                # Determine transaction type based on description
                description = txn[1].lower() if txn[1] else ''
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
                
                transactions.append({
                    'date': txn[0],
                    'description': txn[1],
                    'amount': float(amount),
                    'from_account': txn[3],
                    'to_account': txn[4],
                    'type': txn_type
                })
            
            return transactions
        
        return []
    
    def validate_account_exists(self, account_number):
        """Check if an account exists."""
        query = 'SELECT 1 FROM users WHERE account_number = ?'
        result = self.execute_query(query, (account_number,), fetch='one')
        return result is not None