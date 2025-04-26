# set_admin.py

from website import db
from website.models import User

def set_admin_role(email):
    user = User.query.filter_by(email=email).first()
    if user:
        user.role = 'admin'
        db.session.commit()
        print(f"Updated {email} to admin.")
    else:
        print(f"User {email} not found.")

if __name__ == "__main__":
    set_admin_role("test-02-20@gmail.com")


# $env:FLASK_APP = "main.py"    # Only needed if Flask context is required
# python set_admin.py