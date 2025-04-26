import unittest
import sys
from pathlib import Path

# Add app root to import path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from website import create_app, db
from website.models import Subscriber, User
from werkzeug.security import generate_password_hash


class TestSubscriberAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app(test_config={
            "TESTING": True,
            "SECRET_KEY": "test-secret", 
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_TRACK_MODIFICATIONS": False
        })

        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        # Create and commit a real user (let SQLAlchemy assign ID)
        self.test_user = User(
            email='test@example.com',
            password=generate_password_hash('test123', method='sha256')
        )
        db.session.add(self.test_user)
        db.session.commit()

        self.login(user_id=self.test_user.id)

    def login(self, user_id):
        with self.client.session_transaction() as sess:
            sess['_user_id'] = str(user_id)  # Flask-Login stores as string

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_post_subscriber(self):
        res = self.client.post('/api/subscribers', json={
            'email': 'api_test@example.com',
            'user_id': self.test_user.id
        })
        self.assertEqual(res.status_code, 201)
        self.assertIn('success', res.get_json())

        sub = Subscriber.query.filter_by(email='api_test@example.com').first()
        self.assertIsNotNone(sub)

    def test_get_subscribers(self):
        db.session.add(Subscriber(email='gettest@example.com', user_id=self.test_user.id))
        db.session.commit()

        res = self.client.get('/api/subscribers')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('subscribers', data)
        self.assertGreaterEqual(len(data['subscribers']), 1)

    def test_post_duplicate_email(self):
        db.session.add(Subscriber(email='dupe@example.com', user_id=self.test_user.id))
        db.session.commit()

        res = self.client.post('/api/subscribers', json={
            'email': 'dupe@example.com',
            'user_id': self.test_user.id
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.get_json())

    def test_delete_subscriber(self):
        sub = Subscriber(email='todelete@example.com', user_id=self.test_user.id)
        db.session.add(sub)
        db.session.commit()

        res = self.client.delete(f'/api/subscribers/{sub.id}')
        self.assertEqual(res.status_code, 200)
        self.assertIn('success', res.get_json())

        deleted = Subscriber.query.get(sub.id)
        self.assertIsNone(deleted)

    def test_delete_invalid_id(self):
        res = self.client.delete('/api/subscribers/99999')
        self.assertEqual(res.status_code, 404)
        self.assertIn('error', res.get_json())


if __name__ == '__main__':
    unittest.main()
