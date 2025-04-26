# For Login page, signup page and sign out function
from flask import Blueprint, render_template, request, flash, redirect, url_for, request, jsonify

# for db
from .models import User
from . import db  ##means from __init__.py import db

# import from flash_login to hash password, securely storing password intead of storing them in  in plain text
# converting password  to something more secure (hash -> does not have an inverse )
# hash password, basically can only check the entered password == to the hash(password) not the way around
from werkzeug.security import generate_password_hash, check_password_hash

# you can not access the home page unless yourre logged in
# these import are the reeason why for UserMixer in the models.py so that we can use the current_user object to access the current user
from flask_login import login_user, login_required, logout_user, current_user

auth = Blueprint("auth", __name__)


# route to /login
@auth.route("/login", methods=["GET", "POST"])
def login():
    print("Login request received")  # Debug log
    if request.method == "POST":
        try:
            data = request.get_json()
            print("Login data:", data)  # Debug log
            email = data.get("email")
            password = data.get("password")

            user = User.query.filter_by(email=email).first()
            if user:
                if check_password_hash(user.password, password):
                    login_user(user, remember=True)
                    return jsonify({
                        "message": "Logged in successfully!",
                        "user": {
                            "email": user.email,
                            "firstName": user.first_name
                        }
                    }), 200
                else:
                    return jsonify({"error": "Incorrect password"}), 401
            else:
                return jsonify({"error": "Email does not exist"}), 404
        except Exception as e:
            print("Login error:", str(e))  # Debug log
            return jsonify({"error": str(e)}), 500
    
    # For GET requests, return the React app
    return render_template("index.html")


# route to sign up page
@auth.route("/sign-up", methods=["GET", "POST"])
def sign_up():
    print("Sign-up request received")  # Debug log
    print("Request method:", request.method)  # Debug log
    if request.method == "POST":
        print("Processing POST request")  # Debug log
        data = request.get_json()
        print("Received data:", data)  # Debug log
        email = data.get("email")
        first_name = data.get("firstName")
        password = data.get("password")

        # check if the user has already existed
        user = User.query.filter_by(email=email).first()
        if user:
            return jsonify({"error": "Email already exists"}), 400

        # some conditions
        if not email or len(email) < 4:
            return jsonify({"error": "Email must be greater than 3 characters."}), 400
        elif not first_name or len(first_name) < 2:
            return jsonify({"error": "First name must be greater than 1 character."}), 400
        elif not password or len(password) < 7:
            return jsonify({"error": "Password must be at least 7 characters"}), 400
        else:
            # add user to db
            new_user = User(
                email=email,
                first_name=first_name,
                password=generate_password_hash(password, method="pbkdf2:sha256"),
            )
            # add newly created user to database
            db.session.add(new_user)
            # add and then commit(update)
            db.session.commit()
            # remember=true for flask is to remember user login
            login_user(new_user, remember=True)
            return jsonify({"message": "Account created successfully!"}), 201

    return jsonify({"error": "Invalid request method"}), 405


@auth.route("/logout")
# decorator -> make sure that we cannot acces the  def logout() or root /logout unless the user is logged_in, basically we not be able to logout if we not login
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


@auth.route("/api/check-auth")
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True,
            "user": {
                "email": current_user.email,
                "firstName": current_user.first_name
            }
        }), 200
    return jsonify({"authenticated": False}), 401

# Add test endpoint
@auth.route("/api/test", methods=["GET"])
def test_api():
    return jsonify({
        "status": "success",
        "message": "API is working correctly"
    }), 200
