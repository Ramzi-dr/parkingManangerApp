from flask import Flask, jsonify, request, Response, session
from gpio import control_relay, relay_1
from models import CarData
from log_manager import add_log
from configuration import app,  socket_io
from flask_authChecker import requires_auth
import asyncio, json


def check_plate(plate):
    car = CarData.query.filter_by(car_licence_plate=plate).first()
    return car is not None

@app.route('/api/anpr_data', methods=['POST'])
@requires_auth
def receive_anpr_data():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        socket_io.emit('anpr_data_received', data)
        received_plate = data['plate'].upper()

        car_exist = check_plate(plate=received_plate)
        if car_exist:
            socket_io.emit('relay_is_on')
            socket_io.sleep(0)  # Ensure the emit is sent before proceeding
            # Run the relay control function as a background task
            socket_io.start_background_task(control_relay, relay_1)
            logfile_data = {
                'plate': received_plate,
                'got_access': True
            }
            add_log(data=logfile_data)

            return jsonify({'status': 'succes', 'message': f'the gate is open for: {received_plate} '}), 200
        
        # The data you want to send in the POST request
        logfile_data = {
            'plate': received_plate,
            'got_access': False
        }
        add_log(data=logfile_data)

        return jsonify({'status': 'success', 'message': f'But no car with the plate {received_plate} was found in our data.'}), 200

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
