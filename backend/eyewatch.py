import eventlet
import requests
import base64
from flask import Flask, jsonify, request, Response, session
from gpio import control_relay, relay_1
from configuration import   socket_io
from datetime import datetime
import logging
url = "http://192.168.21.82/api/anpr/v2/live/result"
auth_value = base64.b64encode(b'admin:3018Bern!').decode('utf-8')
headers = {
  'Authorization': f'Basic {auth_value}'
}
def poll_camera_api():
    while True:

        # Get the current time
        now = datetime.now()

        # Format and print the time
        #print(now.strftime("%H:%M:%S"))

        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                data = response.json()
              #  print(data)
                # Process the data (e.g., check if there's a new event)
                # if data.get('new_event'):
                #     car_plate = data.get('car_plate')
                #     event_time = data.get('event_time')
                    
                    
                #     # Notify frontend
                #     socket_io.emit('gate_opened', {'car_plate': car_plate, 'event_time': event_time})
            else:
               # print("Failed to get data from camera:", response.status_code)
                # type: ignore
                logging.error(
                    f'ailed to get data from camera: {response.status_code}')
        except Exception as e:
           # print(f"Error polling camera API: {e}")
            logging.error(f"Error polling camera API: {e}")
        eventlet.sleep(100)  # Sleep for 1 second before polling again



