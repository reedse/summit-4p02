from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
import pytz
from sqlalchemy import and_
import logging

from .models import ScheduledPost
from . import db
from .views import publish_to_platform, decrypt_api_key


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_scheduled_posts(app):
    with app.app_context():  # <-- add this line

        """
        Process scheduled posts that are due to be published
        This function is called by the scheduler every minute
        """
        logger.info("Processing scheduled posts...")
        
        # Get current time in UTC
        now = datetime.now(pytz.UTC)
        
        # Find posts that are scheduled for now or in the past and still have 'scheduled' status
        posts_to_process = ScheduledPost.query.filter(
            and_(
                ScheduledPost.scheduled_time <= now,
                ScheduledPost.status == 'scheduled'
            )
        ).all()
        
        logger.info(f"Found {len(posts_to_process)} posts to process")
        
        for post in posts_to_process:
            try:
                # Get platforms as a list
                platforms = post.platforms.split(',')
                
                # Process each platform
                results = {}
                for platform in platforms:
                    # In a real app, we would use the stored API tokens
                    # For now, we'll just call the publish function
                    result = publish_to_platform(platform, post.content, post.user_id)
                    results[platform] = result
                
                # Check if all platforms were successful
                all_successful = all(result.get('success', False) for result in results.values())
                
                if all_successful:
                    post.status = 'posted'
                    logger.info(f"Post {post.id} published successfully")
                else:
                    post.status = 'failed'
                    # Collect error messages
                    errors = [f"{platform}: {result.get('error', 'Unknown error')}" 
                            for platform, result in results.items() 
                            if not result.get('success', False)]
                    post.error_message = '; '.join(errors)
                    logger.error(f"Post {post.id} failed: {post.error_message}")
                
                # Update the post in the database
                db.session.commit()
                
            except Exception as e:
                logger.exception(f"Error processing post {post.id}: {str(e)}")
                post.status = 'failed'
                post.error_message = str(e)
                db.session.commit()
                
def init_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=lambda: process_scheduled_posts(app),  # pass app to the job
        trigger=IntervalTrigger(minutes=1),
        id='process_scheduled_posts',
        name='Process scheduled social media posts',
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler started for processing scheduled posts")
    return scheduler

