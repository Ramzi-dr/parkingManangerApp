import os
from log_manager import log_manager_starter
import logging
import sys
import fcntl
import eventlet  # type: ignore
import threading  # Import threading module
from flask import Flask, jsonify, request, Response  # type: ignore
from socketio_manager import SocketIOManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from gpio import control_relay, relay_1
from configuration import app, db, socket_io
from crud_sub_users import get_sub_users, create_sub_user, update_sub_user, delete_sub_user_by_email
from crud_users import get_users, create_user, update_user, delete_user_by_email, register, update_password, login, logout, check_login, reset_user_or_sub_user_password
from crud_cars import get_carsData, create_carData, update_carData, delete_carData
from crud_emails import get_emails, create_email, update_email, delete_email_by_email
from ajax import alarm_system
from crud_time_profiles import *
from anpr_handler import receive_anpr_data
from eyewatch import poll_camera_api
# Import the start_email_thread function
from backup_db import start_email_thread


socket_io_manager = SocketIOManager()

# Path to lock file to ensure single instance
lock_file = '/tmp/flask_app.lock'


def ensure_single_instance():
    try:
        # Open lock file (creates the file if it doesn't exist)
        with open(lock_file, 'w') as f:
            # Try to acquire an exclusive non-blocking lock
            fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
            f.write(str(os.getpid()))  # Write current process ID to lock file
            return True
    except IOError:
        # Lock file already locked, another instance is running
        return False


# Ensure only one instance of the app can run
if not ensure_single_instance():
    logging.warning("Another instance of this script is already running.")
    sys.exit(1)

# SocketIO event handlers


# @socket_io.on('connect')
# def handle_connect():
    # logging.info(f'Client connected: {request.sid}')  # type: ignore


@socket_io.on('click_event')
def handle_click_event(data):
    eventlet.spawn(control_relay, relay_1)
    socket_io.emit('click_event')


@socket_io.on('arm')
def arm(data):
    response_data = {
        "status": "armed",
        "message": "Alarm is now armed."
    }
    socket_io.emit('arm', response_data)


@socket_io.on('disarm')
def disarm(data):
    response_data = {
        "status": "disarmed",
        "message": "Alarm is now disarmed."
    }
    socket_io.emit('disarm', response_data)


# @socket_io.on('disconnect')
# def handle_disconnect():
    # logging.info(f'Client disconnected: {request.sid}')  # type: ignore


# Start the polling of Eyewatch camera in a green thread
# eventlet.spawn(poll_camera_api)

if __name__ == '__main__':
  
    log_manager_starter()
    # Start the email thread in the background
    email_thread = threading.Thread(target=start_email_thread)
    email_thread.daemon = True  # This makes the thread exit when the main program exits
    email_thread.start()

    logging.info("Email thread started.")

    

    with app.app_context():
        try:
            # Drop all tables
            # db.drop_all()
            ##############################################################################
            # drop cars table
            # db.metadata.drop_all(bind=db.engine, tables=[db.metadata.tables['car_data']])
            ##############################################################################
            # drop time profile table
            # db.metadata.drop_all(bind=db.engine, tables=[db.metadata.tables['time_profile']])
            ##############################################################################
            # drop user table
            # db.metadata.drop_all(bind=db.engine, tables=[db.metadata.tables['user']])
            ##############################################################################
            # drop sub_user table
            # db.metadata.drop_all(bind=db.engine, tables=[db.metadata.tables['sub_user']])
            ##############################################################################
            ##############################################################################
            # drop log_file table
            # db.metadata.drop_all(bind=db.engine, tables=[db.metadata.tables['log_file']])
            ##############################################################################
            # create a table
            db.create_all()
            socket_io.run(app, host='0.0.0.0', port=5000,
                          debug=False, use_reloader=False, log_output=False)
            # '0.0.0.0'
        except Exception as e:
            logging.error(
                f"Error occurred while running the application: {e}")
