import sys
import os

# Path to your project directory on PythonAnywhere
# You'll need to update this with your actual PythonAnywhere username and path
project_home = '/home/reedse/summit-4p02'

# Name of the Python file containing your Flask app instance
# In this case, it's 'main.py' which imports create_app from website
flask_app_file = 'main'

# Name of the Flask app instance variable in that file
flask_app_variable = 'app'

if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import the application instance
try:
    exec(f'from {flask_app_file} import {flask_app_variable} as application')
except ImportError:
    # Handle potential import errors, maybe log them
    # For now, re-raise to see the error in PythonAnywhere logs
    raise

# Optional: Load .env file if you use one for server-side variables
from dotenv import load_dotenv
dotenv_path = os.path.join(project_home, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path) 