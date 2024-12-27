from flask import Flask, jsonify, request, Response
from models import SubUser, User, db
from configuration import app
from flask_authChecker import requires_auth
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import json
import logging

#####################################################################################
################################## Fetch All Sub-Users ##############################
#####################################################################################


@app.route("/api/get_sub_users", methods=["GET"])
@requires_auth
def get_sub_users():
    try:
        sub_users_data = SubUser.query.all()  # Fetch all SubUser instances
        json_sub_users_data = [sub_user.to_json()
                               for sub_user in sub_users_data]

        response_data = json.dumps(
            {"sub_users_data": json_sub_users_data}, indent=4, sort_keys=False
        )
        response = Response(response_data, mimetype='application/json')
        response.headers["Cache-Control"] = "no-store"
        return response
    except SQLAlchemyError as e:
        logging.error(f"Error fetching sub-user data: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500

#####################################################################################
################################## Create Sub-User ##################################
#####################################################################################


@app.route('/api/create_sub_user', methods=['POST'])
@requires_auth
def create_sub_user():
    try:
        data = request.get_json()
        first_name = data.get('first_name', '').capitalize()
        last_name = data.get('last_name', '').capitalize()
        email = data.get('email')
        status = data.get('status')

        if not email or not status:
            return jsonify({"message": "Email and status are required"}), 400

        if status.lower() not in ['inactive', 'active']:
            return jsonify({"message": "Invalid status"}), 400

        email_lower = email.lower()
        status = status.lower()

        # Check if email already exists as a user
        if User.query.filter_by(email=email_lower).first():
            return jsonify({"message": "This email already exists as a user. Please delete it first."}), 400

        # Check if email already exists as a sub-user
        if SubUser.query.filter_by(email=email_lower).first():
            return jsonify({"message": "This email already exists as a sub-user."}), 400

        # Create new sub-user
        new_sub_user = SubUser(
            first_name=first_name,
            last_name=last_name,
            email=email_lower,
            status=status
        )
        db.session.add(new_sub_user)
        db.session.commit()
        return jsonify({"message": "Sub-user created successfully"}), 201
    except IntegrityError as e:
        db.session.rollback()
        logging.error(f"Integrity error during sub-user creation: {str(e)}")
        return jsonify({"message": "Sub-user creation failed due to a database error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500

#####################################################################################
################################## Update Sub-User ##################################
#####################################################################################


@app.route("/api/update_sub_user", methods=["PATCH"])
@requires_auth
def update_sub_user():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"message": "Sub-user email is required"}), 400

        email_lower = email.lower()
        sub_user_exist = SubUser.query.filter_by(email=email_lower).first()

        if not sub_user_exist:
            return jsonify({"message": f"Sub-user not found with email: {email_lower}"}), 404

        fields_changed = False

        # Update fields if provided and different
        if "status" in data and data["status"].lower() in ['inactive', 'active']:
            if data["status"].lower() != sub_user_exist.status:
                sub_user_exist.status = data["status"].lower()
                fields_changed = True

        if "new_email" in data and data["new_email"].replace(" ", "").lower() != sub_user_exist.email:
            new_email = data["new_email"].replace(" ", "").lower()

            # Check if the new email already exists in User or SubUser
            if User.query.filter_by(email=new_email).first() or SubUser.query.filter_by(email=new_email).first():
                return jsonify({"message": "This email already exists in the system. Update failed."}), 400

            sub_user_exist.email = new_email
            fields_changed = True

        if "first_name" in data and data["first_name"].strip().capitalize() != sub_user_exist.first_name:
            sub_user_exist.first_name = data["first_name"].strip().capitalize()
            fields_changed = True

        if "last_name" in data and data["last_name"].strip().capitalize() != sub_user_exist.last_name:
            sub_user_exist.last_name = data["last_name"].strip().capitalize()
            fields_changed = True

        if fields_changed:
            db.session.commit()
            return jsonify({
                "message": f"Sub-user with email: {email_lower} updated successfully.",
                "sub_user": {
                    "status": sub_user_exist.status,
                    "email": sub_user_exist.email,
                    "first_name": sub_user_exist.first_name,
                    "last_name": sub_user_exist.last_name
                }
            }), 200
        else:
            return jsonify({"message": "No changes detected. Nothing was updated."}), 200
    except IntegrityError:
        db.session.rollback()
        logging.error("Integrity error during sub-user update.")
        return jsonify({"message": "Email must be unique. Update failed."}), 400
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500

#######################################################################################
################################## Delete Sub-User ####################################
#######################################################################################


@app.route('/api/delete_sub_user', methods=['DELETE'])
@requires_auth
def delete_sub_user_by_email():
    try:
        data = request.get_json()
        email = data.get('email')
        force_delete = data.get('forceDelete', False)

        if not email:
            return jsonify({"message": "Email is required"}), 400
        if not force_delete:
            return jsonify({"message": "Add 'forceDelete': true to the request to delete the sub-user."}), 400

        email_lower = email.lower()
        sub_user_to_delete = SubUser.query.filter_by(email=email_lower).first()
        if sub_user_to_delete:
            db.session.delete(sub_user_to_delete)
            db.session.commit()
            return jsonify({"message": "Sub-user deleted successfully"}), 200
        else:
            return jsonify({"message": "Email not found"}), 404
    except Exception as e:
        logging.error(f"Error deleting sub-user: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500
