import logging
import os
from configuration import app
from crud_logfile import create_log


def add_log(data):
    # Set up a mock request context and call the function directly
    with app.test_request_context(json=data):
        response, status_code = create_log()  # Unpack the tuple directly

        # Check and print the response JSON
        response_data = response.get_json()
        if status_code != 201:
            logging.error("Error:", response_data or "No JSON returned")


def logfile_creator():
    # Create the log directory if it doesn't exist
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_dir = os.path.join(script_dir, 'log')
    os.makedirs(log_dir, exist_ok=True)  # Ensure the log directory exists
    log_file = os.path.join(log_dir, 'app.log')  # Path to the log file
    return log_file


def log_manager_starter():
    try:
        # Create the log file path
        log_file = logfile_creator()

        # Set up logging with both file and console handlers
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(levelname)s: %(message)s',
            handlers=[
                logging.StreamHandler(),  # StreamHandler for console output
                logging.FileHandler(log_file)  # FileHandler for log file
            ]
        )
        logging.info("Logging started.")
    except Exception as e:
        print(f'Error setting up logging: {e}')


