from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_mail import Mail
from flask import request

# Load environment variables from .env file
load_dotenv()

# Also load from .env.local if it exists (overrides .env)
if os.path.exists('.env.local'):
    load_dotenv('.env.local', override=True)
    print("Loaded environment variables from .env.local")

db = SQLAlchemy()
DB_NAME = "database.db"

# Global variable to hold the scheduler instance
scheduler = None

migrate = Migrate()
login_manager = LoginManager()
mail = Mail()

def create_app(test_config=None):
    global scheduler
    app = Flask(__name__, static_folder='static', template_folder='templates')
    
    # Load configuration
    if test_config:
        app.config.update(test_config)
    else:
        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
            SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', f'sqlite:///{DB_NAME}'),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            OPENAI_API_KEY=os.environ.get('OPENAI_API_KEY', ''),
            NEWS_API_KEY=os.environ.get('NEWS_API_KEY', ''),
            # Mail settings
            MAIL_SERVER=os.environ.get('MAIL_SERVER', 'smtp.gmail.com'),
            MAIL_PORT=int(os.environ.get('MAIL_PORT', 587)),
            MAIL_USE_TLS=os.environ.get('MAIL_USE_TLS', 'True') == 'True',
            MAIL_USERNAME=os.environ.get('MAIL_USERNAME', ''),
            MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD', ''),
            MAIL_DEFAULT_SENDER=os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@example.com'),
        )

    # Configure CORS properly with credentials support
    CORS(app, 
        resources={r"/*": {"origins": ["http://localhost:3000", "https://summit-4p02.vercel.app"]}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         expose_headers=["Content-Type", "X-CSRFToken"])

    # Configure the static files serving for React SPA
    app.static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'website/templates/dist')
    app.static_url_path = ''

    db.init_app(app)
    migrate.init_app(app, db)  # Important: Initialize Flask-Migrate here

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    from .models import User, Note, ScheduledPost, Article, FavoriteArticle

    with app.app_context():
        db.create_all()
        
        # Create temp_media directory for file uploads
        media_dir = os.path.join(app.root_path, 'temp_media')
        if not os.path.exists(media_dir):
            os.makedirs(media_dir)

    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))
    
    from .scheduler import init_scheduler
    scheduler = init_scheduler(app)

    mail.init_app(app)

    # Handle OPTIONS request for CORS preflight
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'  # Allow all origins for now
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Accept,X-Requested-With,Origin'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '3600'  # Cache preflight for 1 hour
        return response

    # Additional CORS headers for every response
    @app.after_request
    def after_request(response):
        if request.method != 'OPTIONS':  # Skip for OPTIONS which is handled above
            # Get the request origin or default to '*'
            origin = request.headers.get('Origin', '*')
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Accept,X-Requested-With,Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    return app


def create_database(app):
    if not path.exists("website/" + DB_NAME):
        with app.app_context():
            db.create_all()
        print("Created Database!")

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
