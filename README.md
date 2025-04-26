# Summit (4P02-G11)

## Overview
A content management system with AI-powered features for content creation, management, and social media integration.

Made by:
- Sean Reed,
- Ethan Green,
- Mark Zupan,
- Mew Tanglimsmarnsuk, 
- Mohammad Safari, 
- Esbah Majoka, 
- Long Tong, 

## Setup & Installation

### Prerequisites
- Python 3.x
- Node.js and npm
- SQLite (included)

### Backend Setup
1. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup
1. Install frontend dependencies:
   ```bash
   cd website/templates
   npm install
   ```

### Environment Configuration
1. Configure environment variables in `.env.local` file in root directory.

## Running the Application

### Start Backend Server
```bash
python3 main.py
```
Backend will run on: http://127.0.0.1:5000/

### Start Frontend Development Server
```bash
cd website/templates
npm run dev
```
Frontend will run on: http://127.0.0.1:3000/

## Navigation Guide

### Main Pages
- **Dashboard**: http://127.0.0.1:3000/ or http://127.0.0.1:3000/dashboard
- **Login**: http://127.0.0.1:3000/login
- **Sign-up**: http://127.0.0.1:3000/sign-up

- **Content Editor**: http://127.0.0.1:3000/editor
- **Templates**: http://127.0.0.1:3000/template
- **AI Summary**: http://127.0.0.1:3000/ai-summary
- **Post System**: http://127.0.0.1:3000/post-system
- **Favourites**: http://127.0.0.1:3000/favourites
- **Newsletters**: http://127.0.0.1:3000/newsletters
- **History**: http://127.0.0.1:3000/history

## Database Management

### Viewing the Database
1. Use [SQLite Viewer](https://sqliteviewer.app/)
2. Drag and drop `database.db` from the `instance` folder onto the site

**Note**: The SQLite Viewer doesn't update automatically. You'll need to re-upload the file to see any database changes.

## Running Tests
```bash
pytest
```

## Troubleshooting

If you encounter any issues:
1. Ensure all dependencies are properly installed
2. Check that both backend and frontend servers are running
3. Verify environment variables are correctly set
