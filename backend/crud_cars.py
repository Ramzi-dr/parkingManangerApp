from flask import Flask, jsonify, request, Response, session
from models import CarData, TimeProfile, User, db
from configuration import app
from flask_authChecker import requires_auth
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
import json
from datetime import datetime
import logging

# Retrieve all car data


@app.route("/api/carsData", methods=["GET"])
@requires_auth
def get_carsData():
    try:
        cars_data = CarData.query.all()
        json_carsData = list(map(lambda x: x.to_json(), cars_data))
        response_data = json.dumps(
            {"carsData": json_carsData}, indent=4, sort_keys=False)
        response = Response(response_data, mimetype='application/json')
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as e:
        logging.error(f"Error retrieving car data: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

# Create new car data


@app.route("/api/create_carData", methods=["POST"])
@requires_auth
def create_carData():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"message": "Invalid or missing JSON in request"}), 400

        isWhitelisted = data.get("isWhitelisted")
        carLicencePlate = data.get(
            "carLicencePlate", "").replace(" ", "").upper()
        firstName = data.get("firstName", "").capitalize()
        lastName = data.get("lastName", "").capitalize()
        startTime = data.get('startTime', '00:00:00')
        endTime = data.get('endTime', '23:59:59')
        days = data.get('days', ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"])

        if not firstName or not lastName or not carLicencePlate:
            return jsonify({"message": "You must include a first name, last name, and car licence plate"}), 400

        days_str = ','.join(days)

        existing_car = CarData.query.filter_by(
            car_licence_plate=carLicencePlate).first()
        if existing_car:
            return jsonify({"message": "This car licence plate exists in the database"}), 400

        new_carContact = CarData(
            is_whitelisted=isWhitelisted,
            car_licence_plate=carLicencePlate,
            first_name=firstName,
            last_name=lastName,
            start_time=datetime.strptime(startTime, '%H:%M:%S').time(),
            end_time=datetime.strptime(endTime, '%H:%M:%S').time(),
            days=days_str
        )

        db.session.add(new_carContact)
        db.session.commit()
        logging.info(f'Car created=> Plate: {carLicencePlate} Owner: {firstName} {lastName} ')
        return jsonify({"message": "Car data created successfully!"}), 201

    except IntegrityError as e:
        db.session.rollback()
        logging.error(f"Integrity Error creating car data: {e}")
        return jsonify({"message": "Database Integrity Error"}), 400

    except Exception as e:
        logging.error(f"Error creating car data: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

# Update car data by ID


@app.route("/api/update_carData/<int:id>", methods=["PATCH"])
@requires_auth
def update_carData(id):
    try:
        carData = CarData.query.get(id)
        if not carData:
            return jsonify({"message": f"Car not found with id: {id}"}), 404

        data = request.get_json()
        fields_changed = False

        if "isWhitelisted" in data and data["isWhitelisted"] != carData.is_whitelisted:
            carData.is_whitelisted = data["isWhitelisted"]
            fields_changed = True

        if "carLicencePlate" in data and data["carLicencePlate"].upper().replace(" ", "") != carData.car_licence_plate:
            if CarData.query.filter_by(car_licence_plate=data["carLicencePlate"].upper().replace(" ", "")).first():
                return jsonify({"message": "Car Licence Plate must be unique. Update failed."}), 400
            carData.car_licence_plate = data["carLicencePlate"].upper().replace(
                " ", "")
            fields_changed = True

        if "firstName" in data and data["firstName"].capitalize() != carData.first_name:
            carData.first_name = data["firstName"].capitalize()
            fields_changed = True

        if "lastName" in data and data["lastName"].capitalize() != carData.last_name:
            carData.last_name = data["lastName"].capitalize()
            fields_changed = True

        if fields_changed:
            db.session.commit()
            logging.info(f'Car with plate: {data["carLicencePlate"]} is updated')
            return jsonify({
                "message": f"Car with id {id} updated successfully.",
                "carData": {
                    "isWhitelisted": carData.is_whitelisted,
                    "carLicencePlate": carData.car_licence_plate,
                    "firstName": carData.first_name,
                    "lastName": carData.last_name
                }
            }), 200
        else:
            return jsonify({"message": "No changes detected. Nothing was updated."}), 200

    except IntegrityError as e:
        db.session.rollback()
        logging.error(f"Integrity Error updating car data with id {id}: {e}")
        return jsonify({"message": "Database Integrity Error"}), 400

    except Exception as e:
        logging.error(f"Error updating car data with id {id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

# Delete car data by ID


@app.route("/api/delete_carData/<int:car_id>", methods=["DELETE"])
@requires_auth
def delete_carData(car_id):
    
    try:
        carData = CarData.query.get(car_id)
        if not carData:
            return jsonify({"message": "Car not found"}), 404

        carData.time_profiles.clear()
        db.session.delete(carData)
        db.session.commit()
        logging.info(f'Car: {carData.car_licence_plate} is deleted successfully')

        return jsonify({"message": "Car deleted successfully"}), 200

    except Exception as e:
        logging.error(f"Error deleting car data with id {car_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
