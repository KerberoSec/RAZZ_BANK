#!/bin/bash

echo "Setting up Razz Bank SQL Injection Challenge..."

# Create necessary directories
mkdir -p templates
mkdir -p static/css
mkdir -p static/js

# Create requirements.txt if it doesn't exist
if [ ! -f requirements.txt ]; then
    echo "Flask==2.3.3" > requirements.txt
    echo "Werkzeug==2.3.7" >> requirements.txt
fi

# Make sure the database is initialized
python3 -c "from app import init_db; init_db()"

echo "Setup complete! You can now run the application."
