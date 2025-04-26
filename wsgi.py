import sys
import os
import logging

# Set up logging
logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
logging.debug("WSGI initialization started")

# Path to your project directory on PythonAnywhere
project_home = '/home/reedse/summit-4p02'

# Add project directory to path
if project_home not in sys.path:
    sys.path.insert(0, project_home)
    logging.debug(f"Added {project_home} to sys.path")

# Load environment variables before importing the app
from dotenv import load_dotenv
dotenv_path = os.path.join(project_home, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
    logging.debug(f"Loaded environment from {dotenv_path}")
else:
    logging.debug(f"No .env file found at {dotenv_path}")

# Import the Flask app directly
try:
    from main import app as application
    
    # Add route for SPA client-side routing
    @application.route('/', defaults={'path': ''})
    @application.route('/<path:path>')
    def catch_all(path):
        # Only handle non-API routes
        if not path.startswith('api/') and not path.startswith('login') and not path.startswith('sign-up') and not path.startswith('logout'):
            logging.debug(f"Handling SPA route: {path}")
            return application.send_static_file('index.html')
        return application.full_dispatch_request()
    
    logging.debug("Successfully imported Flask application with SPA routing")
except ImportError as e:
    logging.error(f"Failed to import application: {str(e)}")
    raise

logging.debug("WSGI file loaded successfully") 