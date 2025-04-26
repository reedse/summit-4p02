import unittest
import sys
import os
from pathlib import Path

# Ensure the main project folder is in the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from website import create_app, db
from website.models import Subscriber

class TestSubscriberModel(unittest.TestCase):

    def setUp(self):
        """Set up test app and database"""
        self.app = create_app()
        self.app.config.update({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False
        })

        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        """Clean up after tests"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_create_subscriber(self):
        """Test adding a new subscriber"""
        sub = Subscriber(email='test@example.com', user_id=1)
        db.session.add(sub)
        db.session.commit()

        found = Subscriber.query.filter_by(email='test@example.com').first()
        self.assertIsNotNone(found)
        self.assertEqual(found.email, 'test@example.com')
        self.assertEqual(found.user_id, 1)

    def test_update_subscriber(self):
        """Test updating a subscriber email"""
        sub = Subscriber(email='old@example.com', user_id=2)
        db.session.add(sub)
        db.session.commit()

        sub.email = 'new@example.com'
        db.session.commit()

        updated = Subscriber.query.filter_by(email='new@example.com').first()
        self.assertIsNotNone(updated)
        self.assertEqual(updated.user_id, 2)

    def test_delete_subscriber(self):
        """Test deleting a subscriber"""
        sub = Subscriber(email='delete@example.com', user_id=3)
        db.session.add(sub)
        db.session.commit()

        db.session.delete(sub)
        db.session.commit()

        deleted = Subscriber.query.filter_by(email='delete@example.com').first()
        self.assertIsNone(deleted)

    def test_duplicate_email(self):
        """Test inserting duplicate emails fails (if uniqueness is enforced)"""
        sub1 = Subscriber(email='dupe@example.com', user_id=1)
        db.session.add(sub1)
        db.session.commit()

        sub2 = Subscriber(email='dupe@example.com', user_id=2)
        db.session.add(sub2)
        with self.assertRaises(Exception):  # Expect IntegrityError or similar
            db.session.commit()

if __name__ == '__main__':
    unittest.main()
