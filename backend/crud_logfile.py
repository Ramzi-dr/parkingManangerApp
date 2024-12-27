from flask import Flask, jsonify, request, Response
from models import LogFile, db
from configuration import app
from flask_authChecker import requires_auth
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import json
import logging

@app.route("/api/get_logfile", methods=["GET"])
@requires_auth
def get_logfile():
    try:
        logfile_data = LogFile.query.all()  # Fetch all LogFile instances
        json_logfile_data = [logfile.to_json() for logfile in logfile_data]
        response_data = json.dumps(
            {"logfile_data": json_logfile_data}, indent=4, sort_keys=False
        )
        response = Response(response_data, mimetype='application/json')
        response.headers["Cache-Control"] = "no-store"
        return response
    except SQLAlchemyError as e:
        logging.error(f"Error fetching logfile data: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500


@app.route('/api/create_log', methods=['POST'])
@requires_auth
def create_log():
    try:
        data = request.get_json()
        plate = data.get('plate', '').upper()
        got_access = data.get('got_access')

        if not plate:
            return jsonify({"message": "Plate is required"}), 400

        new_logfile = LogFile(
            plate=plate,
            got_access=got_access
        )
        db.session.add(new_logfile)
        db.session.commit()
        return jsonify({"message": "Log created successfully"}), 201
    except IntegrityError as e:
        db.session.rollback()
        logging.error(f"Integrity error during log creation: {str(e)}")
        return jsonify({"message": "Log creation failed due to a database error"}), 500
    except Exception as e:
        logging.error(f"Error creating log: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500
