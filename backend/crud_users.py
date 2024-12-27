from flask import jsonify, request
from werkzeug.security import generate_password_hash
from flask import Flask, jsonify, request, Response, session
from models import SubUser, User, db
from configuration import app
from flask_authChecker import requires_auth
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
import json
import logging


#####################################################################################
################################## fetch all users ##################################
#####################################################################################


@app.route("/api/get_users", methods=["GET"])
@requires_auth
def get_users():
    users_data = User.query.all()  # Fetch all User instances

    # Create JSON data with OrderedDict
    json_users_data = [user.to_json() for user in users_data]

    # Convert to JSON string with the desired order
    response_data = json.dumps(
        {"users_data": json_users_data}, indent=4, sort_keys=False)

    # Create Response object with JSON string
    response = Response(response_data, mimetype='application/json')
    response.headers["Cache-Control"] = "no-store"
    return response
#####################################################################################
################################## create user  #####################################
#####################################################################################


@app.route('/api/create_user', methods=['POST'])
@requires_auth
def create_user():
    data = request.get_json()
    first_name = data.get('firstName', '').capitalize()
    last_name = data.get('lastName', '').capitalize()
    email = data.get('email')
    status = data.get('status')  # store status in lowercase

    if not email or not status:
        return jsonify({"message": "Email and status are required"}), 400

    if status not in ['inactive', 'active']:
        return jsonify({"message": "Invalid status"}), 400

    email_lower = email.lower()
    status = status.lower()

    # Check if the user already exists
    user_exist = User.query.filter_by(email=email_lower).first()
    if user_exist:
        return jsonify({"message": "This email already exists as a user."}), 400

    # Check if the email exists as a sub-user
    sub_user_exist = SubUser.query.filter_by(email=email_lower).first()
    if sub_user_exist:
        return jsonify({"message": "This email already exists as a sub-user. Please delete it first."}), 400

    # Create new user
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email_lower,
        status=status
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

#####################################################################################
################################## update user  #####################################
#####################################################################################


@app.route("/api/update_user", methods=["PATCH"])
@requires_auth
def update_user():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "User email is required"}), 404
    email_lower = email.lower()

    user_exist = User.query.filter_by(email=email_lower).first()

    if not user_exist:
        return jsonify({"message": f"user not found with email: {email_lower}"}), 404
    else:

        # Track if any fields have changed
        fields_changed = False

        # Update only changed fields
        if "status" in data and data["status"].lower() in ['inactive', 'active']:
            if data["status"].lower() != user_exist.status:
                user_exist.status = data["status"].lower()
                fields_changed = True

        if "new_email" in data and data["new_email"].replace(" ", "").lower() != user_exist.email:
            new_email = data["new_email"].replace(" ", "").lower()

            # Check if the email exists in the User table (for regular users)
            if User.query.filter_by(email=new_email).first():
                return jsonify({"message": "This email already exists in the system as a user. Update failed."}), 400

            # Check if the email is already used by another sub-user
            if SubUser.query.filter_by(email=new_email).first():
                return jsonify({"message": "This email already exists in the system as a sub-user. Update failed."}), 400

            user_exist.email = new_email
            fields_changed = True

        if "first_name" in data and data["first_name"].strip().capitalize() != user_exist.first_name:
            user_exist.first_name = data["first_name"].strip().capitalize()
            fields_changed = True

        if "last_name" in data and data["last_name"].strip().capitalize() != user_exist.last_name:
            user_exist.last_name = data["last_name"].strip().capitalize()
            fields_changed = True

        # If any field was changed, commit the changes to the database
        if fields_changed:
            try:
                db.session.commit()
                return jsonify({
                    "message": f"user with email:  {email_lower} updated successfully.",
                    "user": {
                        "status": user_exist.status,
                        "email": user_exist.email,
                        "first_name": user_exist.first_name,
                        "last_name": user_exist.last_name
                    }
                }), 200
            except IntegrityError:
                db.session.rollback()  # Rollback the session if there's an error
                return jsonify({"message": "Email must be unique. Update failed."}), 400
        else:
            return jsonify({"message": "No changes detected. Nothing was updated."}), 200


#######################################################################################
###############################   delete a user     ###################################
#######################################################################################
@app.route('/api/delete_user', methods=['DELETE'])
@requires_auth
def delete_user_by_email():
    data = request.get_json()
    email = data.get('email')
    force_delete = data.get('forceDelete', False)

    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not force_delete:
        return jsonify({"message": "Add 'forceDelete': true to the request to delete the user."}), 400

    email_lower = email.lower()
    user_to_delete = User.query.filter_by(email=email_lower).first()
    if user_to_delete:
        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200

    else:
        return jsonify({"message": "Email not found"}), 404


##############################################################################################
######### ## Route for user and sub-user registration (complete account setup)################
#############################################################################################


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    # Extract and capitalize first and last names if they are provided
    first_name = data.get('firstName', '').capitalize()
    last_name = data.get('lastName', '').capitalize()
    email = data.get('email', '').lower()
    password = data.get('password')

    # Validate that first_name, last_name, email, and password are all provided
    if not first_name or not last_name:
        return jsonify({"message": "First name and last name are required"}), 400
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    # Check if user or sub-user exists in the database
    user = User.query.filter_by(email=email).first()
    sub_user = SubUser.query.filter_by(email=email).first()

    if user:
        # User exists
        if user.password_hash:
            # User has a password
            if user.status == 'active':
                return jsonify({"message": "This account exists and has access. Please login."}), 200
            else:
                return jsonify({"message": "Please contact admin to get access."}), 403
        else:
            # User exists but no password
            user.password_hash = generate_password_hash(password)
            user.first_name = first_name
            user.last_name = last_name
            db.session.commit()
            if user.status == 'inactive':
                return jsonify({"message": "Password set. Awaiting admin activation."}), 200
            else:
                return jsonify({"message": "Password set. You can now log in."}), 200
    elif sub_user:
        # Sub-user exists
        if sub_user.password_hash:
            # Sub-user has a password
            if sub_user.status == 'active':
                return jsonify({"message": "This account exists and has access. Please login."}), 200
            else:
                return jsonify({"message": "Please contact admin to get access."}), 403
        else:
            # Sub-user exists but no password
            sub_user.password_hash = generate_password_hash(password)
            sub_user.first_name = first_name
            sub_user.last_name = last_name
            db.session.commit()
            if sub_user.status == 'inactive':
                return jsonify({"message": "Password set. Awaiting admin activation."}), 200
            else:
                return jsonify({"message": "Password set. You can now log in."}), 200
    else:
        # Email not found in either user or sub-user records
        return jsonify({"message": "Email not found. Please contact admin to add your email."}), 400

#######################################################################################
################ Route for user and sub-user to update their password #################
#######################################################################################


@app.route('/api/update_password', methods=['PATCH'])
def update_password():
    data = request.get_json()
    email = session['email']
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not old_password or not new_password:
        return jsonify({"message": "Old password, and new password are required"}), 400
    email_lower = email.lower()
    user = User.query.filter_by(email=email_lower).first()
    sub_user = SubUser.query.filter_by(email=email_lower).first()

    if user:
        if user.check_password(old_password):
            user.password_hash = generate_password_hash(new_password)
            db.session.commit()
            return jsonify({"message": "Password updated successfully"}), 200
        else:
            return jsonify({"message": "Invalid old password"}), 401

    if sub_user:
        if sub_user.check_password(old_password):
            sub_user.password_hash = generate_password_hash(new_password)
            db.session.commit()
            return jsonify({"message": "Password updated successfully"}), 200
        else:
            return jsonify({"message": "Invalid old password"}), 401
    else:
        return jsonify({"message": "Email not found"}), 404

##############################################################################################
################################ login ######################################################
###############################################################################################


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    email_lower = email.lower()
    user = User.query.filter_by(email=email_lower).first()
    sub_user = SubUser.query.filter_by(email=email_lower).first()

    if user:
        if user.status == 'active':
            if user.password_hash:
                if user.check_password(password):
                    # Set session data here
                    session['email'] = email
                    session['user_position'] = 'user'

                    return jsonify({"message": "Login successful"}), 200
                else:
                    return jsonify({"message": "Invalid password"}), 401
            else:
                return jsonify({"message": "You need to register with a valid password to access this account"}), 403
        else:
            return jsonify({"message": "Account is not active. Please contact admin"}), 403
    elif sub_user:
        if sub_user.status == 'active':
            if sub_user.password_hash:
                if sub_user.check_password(password):
                    # Set session data here
                    session['email'] = email
                    session['user_position'] = 'sub_user'

                    return jsonify({"message": "Login successful"}), 200
                else:
                    return jsonify({"message": "Invalid password"}), 401
            else:
                return jsonify({"message": "You need to register with a valid password to access this account"}), 403
        else:
            return jsonify({"message": "Account is not active. Please contact admin"}), 403

    else:
        return jsonify({"message": "Email not found. Please contact admin to add your email."}), 404

##########################################################################################
#################################### check if logged in #################################
##########################################################################################


@app.route('/api/check_login', methods=['GET'])
def check_login():
    try:
        if 'user_position' in session:
            if session['user_position'] == 'user':
                user_email = session['email']
                user = User.query.filter_by(email=user_email).first()

                if user:
                    # Check if the password has been reset
                    if user.password_hash is None:
                        logout()  # Call the logout function if password is None
                        return jsonify({"message": "Your password has been reset. Please log in again."}), 401

                    return jsonify({
                        "message": "User is logged in",
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "user_position": "user"
                    }), 200

                return jsonify({"message": "User not found"}), 404

            elif session['user_position'] == 'sub_user':
                sub_user_email = session['email']
                sub_user = SubUser.query.filter_by(
                    email=sub_user_email).first()
                if sub_user:
                    # Check if the password has been reset
                    if sub_user.password_hash is None:
                        logout()  # Call the logout function if password is None
                        return jsonify({"message": "Your password has been reset. Please log in again."}), 401
                    return jsonify({
                        "message": "Sub User is logged in",
                        "email": sub_user.email,
                        "first_name": sub_user.first_name,
                        "last_name": sub_user.last_name,
                        "user_position": "sub_user"
                    }), 200

                return jsonify({"message": "Sub-user not found"}), 404

            return jsonify({"message": "User position is incorrect"}), 404

        return jsonify({"message": "User is not logged in"}), 401

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

######################################################################
############################ Route for logout####################
#######################################################################


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('email', None)
    session.pop('user_position', None)
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200

#####################################################################################
#######################    reset  password to None          #########################
#####################################################################################


@app.route('/api/reset_password', methods=['PATCH'])
@requires_auth
def reset_user_or_sub_user_password():
    data = request.get_json()
    email = data.get('email')
    reset_password = data.get('resetPassword')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    if reset_password is not True:
        return jsonify({
            "message": "Reset password flag must be true to perform this action.",
            "hint": "Add 'resetPassword': true to the request to reset the password."
        }), 400

    email_lower = email.lower()

    # Check if the email exists as a regular user
    user = User.query.filter_by(email=email_lower).first()

    if user:
        # Reset the password of the regular user
        user.password_hash = None
        db.session.commit()

        # Force logout if the user is currently logged in

        if 'email' in session and session['email'] == email_lower:

            logout()

        return jsonify({"message": "Password has been reset, and user has been logged out. Please go to the registration page to create a new password."}), 200

    # Check if the email exists as a sub-user (sub-users are now global)
    sub_user = SubUser.query.filter_by(email=email_lower).first()

    if sub_user:
        # Reset the password of the sub-user
        sub_user.password_hash = None
        db.session.commit()

        # Force logout if the sub-user is currently logged in
        if 'email' in session and session['email'] == email_lower:
            logout()

        return jsonify({"message": "Password has been reset, and sub-user has been logged out. Please go to the registration page to create a new password."}), 200

    return jsonify({"message": "Email not found as either user or sub-user"}), 404
