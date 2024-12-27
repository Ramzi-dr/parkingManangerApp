from flask import Flask, jsonify, request, Response, session
from models import Email, db
from configuration import app
from flask_authChecker import requires_auth
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import func
import json
import logging


def fetch_emails_data():
    try:
        emails_data = Email.query.all()  # Fetch all Email instances
        json_emails_data = [email.to_json() for email in emails_data]
        response_data = json.dumps(
            {"emails_data": json_emails_data}, indent=4, sort_keys=False
        )
        response = Response(response_data, mimetype="application/json")
        response.headers["Cache-Control"] = "no-store"
        return response
    except SQLAlchemyError as e:
        logging.error(f"Error fetching emails: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500


@app.route("/api/get_emails", methods=["GET"])
@requires_auth
def get_emails():
    try:
        emails_data = Email.query.all()
        json_emails_data = [email.to_json() for email in emails_data]
        response_data = json.dumps(
            {"emails_data": json_emails_data}, indent=4, sort_keys=False
        )
        response = Response(response_data, mimetype="application/json")
        response.headers["Cache-Control"] = "no-store"
        return response
    except SQLAlchemyError as e:
        logging.error(f"Error fetching emails: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500


@app.route("/api/create_email", methods=["POST"])
@requires_auth
def create_email():
    try:
        data = request.get_json()
        first_name = data.get("first_name", "").capitalize()
        last_name = data.get("last_name", "").capitalize()
        email = data.get("email")

        if not email:
            return jsonify({"message": "Email is required"}), 400

        email_lower = email.lower()
        email_exist = Email.query.filter_by(email=email_lower).first()
        if email_exist:
            return jsonify({"message": "This email already exists."}), 400

        new_email = Email(first_name=first_name, last_name=last_name, email=email_lower)
        db.session.add(new_email)
        db.session.commit()
        logging.info(
            f"Backup receiver Email: {email_lower} for {first_name} {last_name} is created"
        )
        return jsonify({"message": "Email created successfully"}), 201
    except IntegrityError as e:

        db.session.rollback()
        logging.error(f"Integrity error during email creation: {str(e)}")
        return (
            jsonify({"message": "Email creation failed due to a database error"}),
            500,
        )
    except Exception as e:
        logging.error(f"Error creating email: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500


@app.route("/api/update_email", methods=["PATCH"])
@requires_auth
def update_email():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"message": "Email is required"}), 400

        email_lower = email.lower()
        email_exist = Email.query.filter_by(email=email_lower).first()

        if not email_exist:
            
            return (
                jsonify({"message": f"Email not found with email: {email_lower}"}),
                404,
            )

        fields_changed = False
        if (
            "first_name" in data
            and data["first_name"].strip().capitalize() != email_exist.first_name
        ):
            email_exist.first_name = data["first_name"].strip().capitalize()
            fields_changed = True

        if (
            "last_name" in data
            and data["last_name"].strip().capitalize() != email_exist.last_name
        ):
            email_exist.last_name = data["last_name"].strip().capitalize()
            fields_changed = True

        if (
            "new_email" in data
            and data["new_email"].replace(" ", "").lower() != email_exist.email
        ):
            new_email = data["new_email"].replace(" ", "").lower()
            if Email.query.filter_by(email=new_email).first():
                return (
                    jsonify({"message": "This email already exists. Update failed."}),
                    400,
                )
            email_exist.email = new_email
            fields_changed = True

        if fields_changed:
            db.session.commit()
            return (
                jsonify(
                    {
                        "message": f"Email with email: {email_lower} updated successfully.",
                        "email": {
                            "first_name": email_exist.first_name,
                            "last_name": email_exist.last_name,
                            "email": email_exist.email,
                        },
                    }
                ),
                200,
            )
        else:
            return (
                jsonify({"message": "No changes detected. Nothing was updated."}),
                200,
            )
    except IntegrityError as e:
        db.session.rollback()
        logging.error(f"Integrity error during email update: {str(e)}")
        return jsonify({"message": "Update failed due to a database error"}), 500
    except Exception as e:
        logging.error(f"Error updating email: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500


@app.route("/api/delete_email", methods=["DELETE"])
@requires_auth
def delete_email_by_email():
    try:
        data = request.get_json()
        email = data.get("email")
        force_delete = data.get("forceDelete", False)

        if not email:
            return jsonify({"message": "Email is required"}), 400
        if not force_delete:
            return (
                jsonify(
                    {
                        "message": "Add 'forceDelete': true to the request to delete the email."
                    }
                ),
                400,
            )

        email_lower = email.lower()
        email_to_delete = Email.query.filter_by(email=email_lower).first()
        if email_to_delete:
            db.session.delete(email_to_delete)
            db.session.commit()
            return jsonify({"message": "Email deleted successfully"}), 200
        else:
            return jsonify({"message": "Email not found"}), 404
    except Exception as e:
        logging.error(f"Error deleting email: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500
