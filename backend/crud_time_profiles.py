from flask import Flask, jsonify, request, Response, session
from models import TimeProfile, CarData, db
from configuration import app
from flask_authChecker import requires_auth
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
import json
import logging
from datetime import datetime

# Standardized error response
def error_response(message, status_code):
    logging.error(message)
    return jsonify({"message": message}), status_code

################################################################################################
# Retrieve all time profiles
################################################################################################
@app.route("/api/get_time_profiles", methods=["GET"])
@requires_auth
def get_timeProfiles():
    try:
        time_profiles = TimeProfile.query.order_by(TimeProfile.title.asc()).all()  # type: ignore
        json_timeProfiles = [x.to_json() for x in time_profiles]
        response_data = json.dumps({"timeProfiles": json_timeProfiles}, indent=4, sort_keys=False)
        response = Response(response_data, mimetype='application/json')
        response.headers["Cache-Control"] = "no-store"
        return response
    except SQLAlchemyError as e:
        return error_response(f"Database error: {str(e)}", 500)
    except Exception as e:
        return error_response(f"Unexpected error: {str(e)}", 500)

################################################################################################
# Create new time profile
################################################################################################
@app.route('/api/create_time_profile', methods=['POST'])
@requires_auth
def create_time_profile():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response('Invalid or missing JSON in request', 400)

        title = data.get('title')
        start_date = data.get('startDate')
        start_time = data.get('startTime')
        end_date = data.get('endDate')
        end_time = data.get('endTime')
        car_ids = data.get('cars', [])

        if not title or not start_date or not start_time:
            return error_response("Missing required fields.", 400)

        new_time_profile = TimeProfile(
            title=title.capitalize(),
            start_date=datetime.strptime(start_date, '%d.%m.%Y').date(),
            start_time=datetime.strptime(start_time, '%H:%M:%S').time(),
            end_date=datetime.strptime(end_date, '%d.%m.%Y').date() if end_date else None,
            end_time=datetime.strptime(end_time, '%H:%M:%S').time() if end_time else None
        )

        for car_id in car_ids:
            car = CarData.query.get(car_id)
            if car:
                new_time_profile.cars.append(car)

        db.session.add(new_time_profile)
        db.session.commit()
        return jsonify({"message": "Time profile created successfully", 'timeProfile': new_time_profile.to_json()}), 201

    except IntegrityError as e:
        db.session.rollback()
        return error_response(f"Integrity error: {str(e)}", 400)
    except SQLAlchemyError as e:
        db.session.rollback()
        return error_response(f"Database error: {str(e)}", 500)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Unexpected error: {str(e)}", 500)

################################################################################################
# Error handler for uncaught exceptions
################################################################################################
@app.errorhandler(500)
def internal_error(e):
    logging.error(f"Internal server error: {str(e)}")
    return jsonify({"message": "An internal server error occurred. Please try again later."}), 500

@app.errorhandler(404)
def not_found_error(e):
    logging.error(f"Not found: {str(e)}")
    return jsonify({"message": "Resource not found."}), 404
