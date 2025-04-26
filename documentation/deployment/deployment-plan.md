# React (Vercel) + Flask/SQLite (PythonAnywhere) Configuration Steps

This document outlines the necessary configuration steps to connect your React frontend hosted on Vercel with your Flask/SQLite backend hosted on PythonAnywhere.

## Phase 1: Pre-Deployment Configuration

### 1. Configure React Frontend (for Vercel)

* **Use Environment Variables for API URL:**
    * Avoid hardcoding the backend URL.
    * Install `dotenv` for local development: `npm install dotenv` or `yarn add dotenv`.
    * Create a `.env` file in the React project root (for local use):
        ```
        REACT_APP_API_URL=[http://127.0.0.1:5000](http://127.0.0.1:5000) # Your local Flask URL
        ```
    * **Add `.env` to your `.gitignore` file.**
    * Access the URL in your code: `process.env.REACT_APP_API_URL`.
    * *Note: The production URL will be set later in Vercel's dashboard.*

### 2. Configure Flask Backend (for PythonAnywhere)

* **SQLite Database Path:**
    * Use a relative path in your Flask configuration (e.g., `config.py` or app factory):
        ```python
        import os
        basedir = os.path.abspath(os.path.dirname(__file__))
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
            'sqlite:///' + os.path.join(basedir, 'app.db') # 'app.db' is your DB file
        ```
* **Enable CORS (Cross-Origin Resource Sharing):**
    * Install `Flask-CORS`: `pip install Flask-CORS`.
    * Initialize in your Flask app (`app.py` or `__init__.py`):
        ```python
        from flask_cors import CORS

        # ... inside your create_app() function or after app = Flask(__name__)
        # Replace placeholder later with your actual Vercel URL
        CORS(app, resources={r"/api/*": {"origins": "YOUR_VERCEL_APP_URL_PLACEHOLDER"}})
        # Adjust r"/api/*" if your API routes have a different prefix
        ```
    * *Note: You will replace the placeholder URL after deploying the frontend to Vercel.*
* **Create `requirements.txt`:**
    * Generate the file: `pip freeze > requirements.txt`.
    * Ensure `Flask`, `Flask-SQLAlchemy`, `Flask-CORS`, etc., are included.
* **Create WSGI Configuration File (`wsgi.py`):**
    * Create a `wsgi.py` file in your backend project root.
    * Add the following content, **updating the paths and filenames**:
        ```python
        import sys
        import os

        # --- UPDATE THIS ---
        # Path to your project directory on PythonAnywhere
        project_home = '/home/YourPythonAnywhereUsername/path/to/your/flask_app'
        # --- UPDATE THIS ---
        # Name of the Python file containing your Flask app instance
        flask_app_file = 'your_main_flask_file' # e.g., 'run', 'app'
        # --- UPDATE THIS ---
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
        # from dotenv import load_dotenv
        # dotenv_path = os.path.join(project_home, '.env')
        # if os.path.exists(dotenv_path):
        #     load_dotenv(dotenv_path=dotenv_path)
        ```
    * **Crucially update:** `YourPythonAnywhereUsername`, the `path/to/your/flask_app`, `your_main_flask_file`, and `flask_app_variable`.
    * The final variable *must* be named `application`.

### 3. Version Control (Git)

* Ensure both frontend and backend code are committed to Git.
* Push changes to GitHub/GitLab/Bitbucket.

## Phase 2: Post-Deployment Configuration (Final Connection)

*Assume you have deployed React to Vercel (getting `your-react-app.vercel.app`) and Flask to PythonAnywhere (getting `yourusername.pythonanywhere.com`).*

### 1. Update Backend CORS Origin

* Go to PythonAnywhere -> Files.
* Edit your Flask app file where `CORS` is initialized.
* Replace `"YOUR_VERCEL_APP_URL_PLACEHOLDER"` with your actual Vercel frontend URL (e.g., `"https://your-react-app.vercel.app"`).
    ```python
    # Example:
    CORS(app, resources={r"/api/*": {"origins": "[https://your-react-app.vercel.app](https://your-react-app.vercel.app)"}})
    ```
* Save the file.
* Go to PythonAnywhere -> Web tab -> **Reload** your web app.

### 2. Update Frontend API URL Environment Variable

* Go to your Vercel project dashboard -> Settings -> Environment Variables.
* Edit the `REACT_APP_API_URL` variable.
* Set its value to your full PythonAnywhere backend URL (e.g., `https://yourusername.pythonanywhere.com`).
* Save the variable.

### 3. Redeploy Frontend

* Go to your Vercel project dashboard -> Deployments.
* Trigger a redeploy of the latest deployment to ensure it uses the updated environment variable.

## Phase 3: Testing

* Access your Vercel frontend URL.
* Test all features that interact with the backend.
* Check browser developer tools (Network tab, Console) for errors (especially CORS errors).
* Check PythonAnywhere logs (Error log, Server log) for backend issues.

## Phase 4: Specific Deployment Steps

### Frontend Deployment on Vercel

1. **Install Vercel CLI** (optional but helpful):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel** (if using CLI):
   ```bash
   vercel login
   ```

3. **Deploy from CLI** (in your React project directory):
   ```bash
   vercel
   ```
   
   Or configure GitHub integration on Vercel dashboard for automatic deployments.

4. **Configure Build Settings** (on Vercel dashboard):
   - Framework Preset: React
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `build` or `dist` (check your project structure)
   - Install Command: `npm install` or `yarn install`

5. **Set Environment Variables**:
   - `REACT_APP_API_URL`: Backend URL (PythonAnywhere)
   - Any other environment-specific variables

### Backend Deployment on PythonAnywhere

1. **Create a PythonAnywhere Account**:
   - Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)
   - Select a plan that suits your needs

2. **Upload Your Code**:
   - Option 1: Use Git
     ```bash
     # In PythonAnywhere bash console:
     git clone https://github.com/your-username/your-repository.git
     ```
   - Option 2: Upload a ZIP file through the Files tab

3. **Set Up Virtual Environment**:
   ```bash
   # In PythonAnywhere bash console:
   cd ~/your-project-directory
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure Web App**:
   - Go to Web tab → Add a new web app
   - Select "Manual configuration" (not Flask)
   - Choose Python version matching your development environment
   - Enter path to your project directory
   - Configure the WSGI file as described in Phase 1

5. **Set Up Static Files** (if needed):
   - Go to Web tab → Static Files section
   - Map URL paths to directories containing your static files

6. **Database Setup**:
   - SQLite will work automatically if properly configured
   - For initial setup, you may need to run:
     ```bash
     # In PythonAnywhere bash console with venv activated:
     flask db upgrade  # If using Flask-Migrate
     # OR
     python
     >>> from your_app import db
     >>> db.create_all()  # If using basic SQLAlchemy
     ```

## Phase 5: Security Considerations

1. **SSL/HTTPS**:
   - Vercel provides HTTPS by default
   - PythonAnywhere provides HTTPS for paid accounts

2. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use Vercel and PythonAnywhere dashboards to set environment variables

3. **API Security**:
   - Consider implementing API tokens/keys
   - Add rate limiting to prevent abuse
   - Validate all user inputs

4. **CORS Configuration**:
   - Use as restrictive settings as possible
   - Consider limiting to just your frontend domain

## Phase 6: Monitoring and Maintenance

1. **Monitor Application Health**:
   - Set up error logging (e.g., Sentry)
   - Review PythonAnywhere error logs regularly

2. **Database Backups**:
   - Set up regular SQLite database backups
   - Download backups to local storage periodically

3. **Update Dependencies**:
   - Regularly update npm packages and Python dependencies
   - Test updates in development before pushing to production

## Phase 7: Troubleshooting

1. **CORS Issues**:
   - Check browser console for CORS errors
   - Verify CORS configuration in Flask
   - Ensure URLs don't have trailing slashes if not expected

2. **API Connection Problems**:
   - Verify environment variables are set correctly
   - Check network tab in browser developer tools
   - Test API endpoints directly using tools like Postman

3. **Database Issues**:
   - Check file permissions for SQLite database
   - Verify database path is correct
   - Look for database lock errors in logs

4. **Deployment Failures**:
   - Review build logs on Vercel
   - Check error logs on PythonAnywhere
   - Ensure all dependencies are in requirements.txt

