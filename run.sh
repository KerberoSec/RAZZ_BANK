#!/bin/bash

echo "Starting Razz Bank Challenge..."

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Initialize database
python3 -c "from app import init_db; init_db()"

# Run the application
python3 app.py
