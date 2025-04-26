import os
from website import create_app, db
from website.models import Article, FavoriteArticle

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        print("Database tables created successfully!")
        print("Available tables:", tables)
        
        # Verify our new tables exist
        if 'article' in tables and 'favorite_article' in tables:
            print("✅ Article and FavoriteArticle tables created successfully!")
        else:
            print("❌ Error: Article and/or FavoriteArticle tables not found!")

if __name__ == '__main__':
    init_db() 