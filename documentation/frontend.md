# Frontend Documentation

## Project Structure

### Frontend (React + Vite)
```
website/templates/
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── src/
│   ├── main.jsx       # Application entry point
│   ├── App.jsx        # Root component and routing
│   ├── index.jsx      # React DOM rendering
│   ├── components/    # Reusable components
│   │   └── NavBar.jsx # Navigation sidebar
│   ├── pages/         # Page components
│   │   ├── Home.jsx   # Dashboard page
│   │   ├── Editor.jsx # Content editor
│   │   ├── Template.jsx # Template management
│   │   ├── AISummary.jsx # AI content summary
│   │   ├── PostSystem.jsx # Social media posting
│   │   ├── Favourites.jsx # Saved content
│   │   ├── Login.jsx  # User authentication
│   │   ├── Register.jsx # User registration
│   │   ├── Newsletters.jsx # Newsletter management
│   │   └── History.jsx # Content history tracking
│   ├── services/      # API services
│   │   └── api.js     # API client
│   └── utils/         # Utility functions
│       └── draft-polyfill.js # Draft.js helpers
```

### Key Components

1. **App.jsx**
   - Root component
   - Protected route management
   - Authentication state
   - Global layout

2. **NavBar.jsx**
   - Permanent sidebar navigation
   - User authentication status
   - Protected route access
   - Dynamic menu items

3. **Pages**
   - **Home.jsx**: Dashboard and overview
   - **Editor.jsx**: Rich text editor
   - **Template.jsx**: Content template management
   - **AISummary.jsx**: AI-generated summaries
   - **PostSystem.jsx**: Social media scheduling
   - **Favourites.jsx**: Saved content access
   - **Login.jsx**: User authentication
   - **Register.jsx**: New user registration
   - **Newsletters.jsx**: Newsletter creation and scheduling
   - **History.jsx**: Track and analyze sent content

4. **Services**
   - **api.js**: Centralized API client
   - Authentication handling
   - Error management
   - Request/response interceptors

### Routes
```
/                   # Dashboard (protected)
/editor            # Content editor (protected)
/templates         # Template management (protected)
/ai-summary        # AI content summary (protected)
/post-system       # Social media posts (protected)
/favourites        # Saved content (protected)
/newsletters       # Newsletter management (protected)
/history          # Content history tracking (protected)
/login             # User login (public)
/register          # User registration (public)
```

## Framework
- **React.js**: A JavaScript library for building user interfaces.

## UI Library (Styling)
- **Material-UI (MUI)**: A popular React UI framework that implements Google's Material Design.

## Features

### AI Summary Page (AISummary.jsx)
The AI Summary feature provides intelligent content summarization with customizable settings:

#### Components
1. **Configuration Panel**
   - Length slider (10-100%)
   - Tone selection dropdown (Professional, Casual, Academic, Friendly)
   - Real-time configuration updates

2. **Content Display**
   - Side-by-side view of original and summarized content
   - Responsive layout with proper scrolling
   - Clear visual separation of content sections

3. **Control Features**
   - Regenerate button for alternative summaries
   - Visual feedback for loading and cached states
   - Error handling and user notifications

#### Implementation Status
- ✅ Configuration UI components
- ✅ Side-by-side display layout
- ✅ Regenerate functionality
- ✅ Redis caching integration
- 🔄 Loading states (In Progress)
- 🔄 Error handling (In Progress)

#### Usage
```jsx
// Example API call in your component
const generateSummary = async (content, settings) => {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        length: settings.length,
        tone: settings.tone
      })
    });
    const data = await response.json();
    // Handle response...
  } catch (error) {
    // Handle error...
  }
};
```

## Pages
1. **Login / Sign up Pages**
   - Secure user authentication and registration
   - Automatic login after successful registration
   - Immediate redirection to dashboard after authentication
   - State management through React Context
   - Persistent sessions using localStorage
   - Routes:
     - `/login`: Public route for authentication
     - `/register`: Public route for registration

2. **Navigation**
   - Responsive sidebar navigation
   - Dynamic menu items based on authentication state
   - Automatic updates without page refresh
   - Features:
     - Collapsible sidebar
     - Visual feedback for current route
     - User account information display
     - Secure logout functionality

3. **Dashboard / Homepage**
   - Centralized view for users to see collected articles, edit drafts, and track recent activity.

4. **Editor Page** (Implemented)
   - Rich text editor using Draft.js for content creation
   - Basic save functionality (currently logs to console)
   - Clean, minimal interface with Material-UI styling
   - Placeholder for future OpenAI integration
   - Route: `/editor`

5. **History Page**
   - View previously created newsletters or social media posts.

## Tools and Libraries
1. **Rich Text Editor**
   - **Draft.js**: Implemented in Editor page for rich text editing capabilities
   - Current features:
     - Basic text input
     - State management using EditorState
     - Placeholder text
2. **API Requests**
   - **Axios**: A promise-based HTTP client for making API requests (to be implemented).
3. **Routing**
   - **React Router**: Implemented with protected and public routes
   - Current routes:
     - `/login`: Public route for authentication
     - `/register`: Public route for registration
     - `/`: Protected home route
     - `/dashboard`: Protected dashboard route
     - `/editor`: Editor page route

## Implementation Details
1. **Authentication Flow**
   - ✅ User registration with automatic login
   - ✅ Secure login with session management
   - ✅ Protected routes with authentication checks
   - ✅ Dynamic UI updates based on auth state
   - ✅ Persistent sessions using localStorage
   - ✅ Secure logout with state cleanup

2. **Front-end Routes**
   - ✅ Basic routing structure implemented
   - ✅ Protected route wrapper for authenticated routes
   - ✅ Automatic redirects for unauthenticated users
   - ✅ Route-based navigation highlighting

3. **State Management**
   - ✅ Centralized authentication state
   - ✅ Prop-based state updates
   - ✅ localStorage persistence
   - ✅ Real-time UI updates

4. **Material UI Components**
   - ✅ Basic components implemented (Container, Paper, Typography, Button)
   - ✅ Responsive layout structure

5. **Editor Implementation**
   - ✅ Basic Draft.js integration
   - ✅ Material-UI styling
   - Pending:
     - Content persistence
     - AI integration
     - Template management

6. **API Integration**
   - Pending implementation

## Testing
1. **Unit tests** (To be implemented)
2. **Integration tests** (To be implemented)
3. **User acceptance tests** (To be implemented)

## Next Steps
1. Implement content persistence with backend
2. Add OpenAI integration
3. Add template management
4. Implement multi-channel publishing options

## Deployment
- Host on a cloud platform (e.g., Heroku, AWS, or Azure).
- Configure environment variables for API keys and database connections.