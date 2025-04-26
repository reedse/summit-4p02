# set up db models, for user and note, db model -> blueprint for objects that is stored in db
# import db from __init__py.
from . import db
from datetime import datetime

# Usermixin for inheret user object
from flask_login import UserMixin

from sqlalchemy.sql import func


# for user note
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(10000))
    # whenever a note is created, func is called, get whatever time it is the stored inside db.DateTime(timezone=true)
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    # basically a foreign key that point a particular  user, user can create multiple notes, 1 to many relationship, 1 user has many notes
    # for user.id, python class name must create capitalized name , db is lower case
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))


# user db chema
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    # tell flask and sql do the magic, list store diff notes, uppercase 'Note'
    notes = db.relationship("Note")
    # Relationship with scheduled posts
    scheduled_posts = db.relationship("ScheduledPost")
    role = db.Column(db.String(50), default='free')  # Add role field with default value 'user'
    ai_summary_count = db.Column(db.Integer, default=0)
    subscribers = db.relationship('Subscriber', backref='user', lazy=True)
    # Relationship with favorite articles
    favorite_articles = db.relationship('FavoriteArticle', backref='user', lazy=True)
    # Relationship with saved templates
    saved_templates = db.relationship("SavedTemplate", backref="user", lazy=True)


# Social media post scheduling model
class ScheduledPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(1000))
    platforms = db.Column(db.String(200))  # Comma-separated list of platforms
    scheduled_time = db.Column(db.DateTime(timezone=True))
    status = db.Column(db.String(50), default="scheduled")  # scheduled, posted, failed
    error_message = db.Column(db.String(500))
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    
    # Store encrypted API keys - these would be set up per user in a production app
    # In a real app, these would be in a separate table with proper encryption
    twitter_token = db.Column(db.String(500))
    facebook_token = db.Column(db.String(500))
    linkedin_token = db.Column(db.String(500))


# Saved AI Summary model
class SavedSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    headline = db.Column(db.String(200))
    summary = db.Column(db.Text)
    tags = db.Column(db.String(500))  # Comma-separated list of tags/categories
    tone = db.Column(db.String(50))
    length = db.Column(db.Integer)
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    sent_at = db.Column(db.DateTime(timezone=True), nullable=True)  # Add this line
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))


# Favorite Summary model
class FavoriteSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    summary_id = db.Column(db.Integer, db.ForeignKey("saved_summary.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    
    # Add unique constraint to prevent duplicate favorites
    __table_args__ = (db.UniqueConstraint('user_id', 'summary_id', name='unique_user_summary'),)


# Saved Content model
class SavedContent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Subscriber model for newsletter
class Subscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# News Article model
class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(100), unique=True)  # TheNewsAPI unique identifier
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    keywords = db.Column(db.String(500))
    snippet = db.Column(db.Text)
    url = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500))
    language = db.Column(db.String(10))
    source = db.Column(db.String(100))
    categories = db.Column(db.String(200))  # Comma-separated list of categories
    locale = db.Column(db.String(10))
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    favorites = db.relationship('FavoriteArticle', backref='article', lazy=True)

# Favorite Article model
class FavoriteArticle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey("article.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Prevent duplicate favorites
    __table_args__ = (db.UniqueConstraint('user_id', 'article_id', name='unique_user_article'),)

# SavedTemplate model for newsletter templates
class SavedTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, nullable=False)  # ID of the template design
    template_name = db.Column(db.String(200))  # Name of the template design
    summary_id = db.Column(db.Integer, db.ForeignKey("saved_summary.id"), nullable=False)
    headline = db.Column(db.String(200))  # Can be edited from the original summary headline
    content = db.Column(db.Text)  # Can be edited from the original summary content
    # Template3 specific columns
    section1 = db.Column(db.Text, nullable=True)  # First section content for Template3
    section2 = db.Column(db.Text, nullable=True)  # Second section content for Template3
    section3 = db.Column(db.Text, nullable=True)  # Third section content for Template3
    # Template6 specific columns
    content_left = db.Column(db.Text, nullable=True)  # Left column content for Template6
    content_right = db.Column(db.Text, nullable=True)  # Right column content for Template6
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    
    # Relationship with the summary
    summary = db.relationship("SavedSummary", backref="templates")