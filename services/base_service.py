"""
Base service class with common database operations for RAZZ Bank.
Provides unified database access across all services.
"""

import sqlite3
import os

try:
    import psycopg2
    import psycopg2.extras
    HAS_POSTGRESQL = True
except ImportError:
    HAS_POSTGRESQL = False


class BaseService:
    """Base service class providing common database operations."""
    
    def __init__(self):
        self.database_url = os.environ.get('DATABASE_URL', 'sqlite:///razz_bank.db')
        self.use_postgresql = self.database_url.startswith('postgresql://') and HAS_POSTGRESQL
    
    def get_db_connection(self):
        """Get database connection based on configuration."""
        if self.use_postgresql:
            return psycopg2.connect(self.database_url)
        else:
            return sqlite3.connect('razz_bank.db')
    
    def execute_query(self, query, params=None, fetch=None):
        """Execute database query with proper connection handling."""
        conn = self.get_db_connection()
        
        if self.use_postgresql:
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