# Backend Documentation

## Project Structure
```
website/
├── __init__.py          # Flask application factory
├── auth.py             # Authentication routes and logic
├── models.py           # Database models
├── views.py            # Application routes
├── cache.py            # Redis caching implementation
├── tests/              # Test files
│   └── test_redis.py   # Redis connection tests
├── static/             # Static assets
│   ├── index.js        # Legacy JavaScript
│   └── style.css       # Global styles
└── templates/          # Frontend application
    ├── index.html      # Main HTML template
    ├── package.json    # Frontend dependencies
    ├── vite.config.js  # Vite configuration
    └── src/           # React source code
        ├── App.jsx
        ├── main.jsx
        ├── index.jsx
        ├── components/
        ├── pages/
        ├── services/
        └── utils/
```

## Project Structure

### Backend (Flask)
```
website/
├── __init__.py          # Flask application factory
├── auth.py             # Authentication routes and logic
├── models.py           # Database models
├── views.py            # Application routes
├── cache.py            # Redis caching implementation
├── tests/              # Test files
│   └── test_redis.py   # Redis connection tests
├── static/             # Static assets
│   ├── index.js        # Legacy JavaScript
│   └── style.css       # Global styles
└── templates/          # Frontend application
    ├── index.html      # Main HTML template
    ├── package.json    # Frontend dependencies
    ├── vite.config.js  # Vite configuration
    └── src/           # React source code
        ├── App.jsx
        ├── main.jsx
        ├── index.jsx
        ├── components/
        ├── pages/
        ├── services/
        └── utils/
```

### Key Files

1. **__init__.py**
   - Flask application factory
   - Database initialization
   - Blueprint registration
   - Configuration management
   - CORS setup
   - Error handlers

2. **auth.py**
   - User authentication routes
   - Login/register endpoints
   - Session management
   - Password hashing
   - Token generation
   - Protected route decorators

3. **models.py**
   - User model
   - Content model
   - Template model
   - Post model
   - Favorites model
   - Newsletter model
   - SQLAlchemy schemas

4. **views.py**
   - Content management routes
   - Template endpoints
   - AI integration
   - Post scheduling
   - Content retrieval
   - User preferences

### API Endpoints

1. **Authentication**
   ```
   POST /register       # User registration
   POST /login         # User authentication
   GET  /logout        # User logout
   GET  /api/check-auth # Authentication check
   ```

2. **Content Management**
   ```
   GET    /api/templates      # List templates
   POST   /api/templates      # Create template
   GET    /api/ai-summary    # Generate AI summary
   POST   /api/posts         # Schedule post
   GET    /api/favourites    # List favorites
   POST   /api/favourites    # Add to favorites
   ```

3. **Newsletter Management**
   ```
   GET    /api/newsletters         # List newsletters
   POST   /api/newsletters         # Create newsletter
   PUT    /api/newsletters/:id     # Update newsletter
   DELETE /api/newsletters/:id     # Delete newsletter
   POST   /api/newsletters/send    # Send newsletter
   GET    /api/newsletters/stats   # View performance stats
   ```

3. **User Management**
   ```
   GET    /api/user/profile  # Get user profile
   PUT    /api/user/profile  # Update profile
   GET    /api/user/settings # Get settings
   PUT    /api/user/settings # Update settings
   ```

### AI Summary
- `POST /api/summarize`
  - Generate AI-powered summaries with configurable length and tone
  - Parameters:
    - `content`: Text to summarize
    - `length`: Summary length as percentage (default: 50)
    - `tone`: Summary tone (default: 'professional')
  - Returns:
    - `summary`: Generated summary
    - `original_content`: Input text
    - `settings`: Applied configuration
    - `cached`: Whether result was from cache

### Caching System
The application uses Redis Cloud for caching frequently requested summaries:
- Cache key: MD5 hash of content + parameters
- Cache duration: 1 hour (configurable via REDIS_CACHE_EXPIRY)
- Automatic fallback if Redis is unavailable
- SSL/TLS encryption for Redis communication

### Environment Variables
Required environment variables in `.env.local`:
```
OPENAI_API_KEY=your_api_key
REDIS_URL=redis://default:password@host:port
REDIS_CACHE_EXPIRY=3600  # Optional, defaults to 3600
```

## Framework
- **Flask**: A lightweight WSGI web application framework in Python.

## Database
- **SQLite**: For MVP, with the option to switch to PostgreSQL or MongoDB for scalability.

## Authentication System
- **Flask-Login**: For managing user sessions and authentication.
- **Features**:
  - Secure password hashing
  - Session management
  - Automatic login after registration
  - Token-based authentication
  - Session persistence
  - CSRF protection

## AI Integration
- **OpenAI API**: For summarization and content generation.

## Endpoints
1. **User Authentication**
   - `POST /register`: User registration
     - Creates new user account
     - Automatically logs in user
     - Returns user data and authentication token
   - `POST /login`: User login
     - Authenticates user credentials
     - Creates user session
     - Returns user data and authentication token
   - `GET /logout`: User logout
     - Clears user session
     - Invalidates authentication token
   - `GET /api/check-auth`: Authentication check
     - Verifies current session
     - Returns authentication status
2. **Article Fetching**
   - `/fetch-articles`: Fetch articles from specified sources or keywords.
3. **Editor Content Management** (To be implemented)
   - `POST /api/content`: Save editor content
   - `GET /api/content/:id`: Retrieve specific content
   - `PUT /api/content/:id`: Update existing content
   - `DELETE /api/content/:id`: Delete content
4. **AI Summarization**
   - `/summarize`: Generate AI summaries for articles.
5. **Scheduling**
   - `/schedule`: Schedule content generation and distribution.
6. **Dashboard**
   - `/dashboard`: Centralized view for user activity and drafts.
7. **History**
   - `/history`: View previously created newsletters or social media posts.

## Database Models (To be implemented)
1. **Content**
   ```python
   class Content(db.Model):
       id = db.Column(db.Integer, primary_key=True)
       user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
       content = db.Column(db.Text)
       created_at = db.Column(db.DateTime, default=datetime.utcnow)
       updated_at = db.Column(db.DateTime, default=datetime.utcnow)
       type = db.Column(db.String(50))  # 'draft', 'published', etc.
   ```

## Implementation Details
1. **Authentication Flow**
   - Secure password hashing with bcrypt
   - Session-based authentication
   - Automatic login after registration
   - Token generation and validation
   - Session persistence
   - CSRF protection middleware

2. **Set up Flask endpoints** for:
   - User registration with auto-login
   - User authentication
   - Session management
   - Authentication checks
   - Article fetching
   - Scheduling
   - AI requests

3. **Integrate OpenAI API** for summarization and content generation.

4. **Database models** for:
   - Users with secure password handling
   - Articles
   - Schedules
   - Content

## Next Steps
1. Implement Content model and migrations
2. Create REST API endpoints for Editor content management
3. Add content validation and sanitization
4. Implement OpenAI integration endpoints

## Testing
1. **Unit tests** for Flask routes using pytest or unittest.
2. **Integration tests** for API calls to endpoints.
3. **Automated tests** for key workflows.

## Deployment
- Host on a cloud platform (e.g., Heroku, AWS, or Azure).
- Configure environment variables for OpenAI API key and database connections.

## Maintenance & Iteration
- Gather user feedback for continuous improvement.
- Prioritize enhancements (e.g., advanced analytics, multi-language support).