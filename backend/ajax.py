import hashlib
from flask import Flask, jsonify, request, Response, session
from models import CarData, TimeProfile, User, db
from configuration import app
from flask_authChecker import requires_alarm_auth

import requests


@app.route("/api/alarmsystem/<string:action>/<int:code>", methods=["POST", 'GET'])
@requires_alarm_auth
def alarm_system(action, code):
    action = action.upper()
    if action not in ['ARM', 'DISARM']:
        return jsonify({'message': 'action must be Arm or Disarm'}), 400

    try:
        print(action)
        print(code)
        arm_disarm(action)
        return jsonify({'message': 'Action and code received successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


LOGIN_ENDPOINT = "/login"
# X_API_KEY = "E2mYZ14jwDdhKGsvMv0mpSR/x6Q9F6sq"
X_COMPANY_API_KEY = 'uVMIHlbj8xiS0SFaOPP13s2/kn6SKJ6J'
X_COMPANY_TOKEN = 'eGz88Q8gkrXLgA2MZLjuT8H'
X_COMPANY_ID = 'AABC2962'

API_BASE_URL = "https://api.ajax.systems/api"
# USER_ID = "575D2843"
# USER_X_API_KEY = "E2mYZ14jwDdhKGsvMv0mpSR/x6Q9F6sq"
HUB_ID = "002222B6"
ARMING_URL = f"/company/{X_COMPANY_ID}/hubs/{HUB_ID}/commands/arming"
HUB_INFO_URL = f"/company/{X_COMPANY_ID}/hubs/{HUB_ID}"



# Helper function to set headers
def get_headers():
    return {
        "Content-Type": "application/json",
        "X-Company-Token": X_COMPANY_TOKEN,
        "X-Api-Key": X_COMPANY_API_KEY,
        'companyId': X_COMPANY_ID
    }


# Get current alarm status
def alarm_status():
    print('status is called')

    try:
        response = requests.get(
            API_BASE_URL + HUB_INFO_URL, headers=get_headers())
        response.raise_for_status()  # Raises an error for 4xx/5xx responses
        print('after try')
        return response.json().get("state")
    except requests.RequestException as error:
        print(f"Error: {error}")
        if error.response:
            print("Response data:", error.response.json())
            print("Response status:", error.response.status_code)
    print('after except')
    return None  # Return None if status check fails

# Arm or disarm the alarm


def arm_disarm(action):

    alarm_state = alarm_status()
    print(alarm_state)
    if alarm_state is None:
        print("Failed to retrieve alarm status.")
        return
    if (action == "ARM" and alarm_state == "ARMED") or (action == "DISARM" and alarm_state == "DISARMED"):
        print(f"Alarm is already {alarm_state.lower()}ed!")
    else:
        data = {"command": action, "ignoreProblems": True}
        try:
            response = requests.put(
                API_BASE_URL + ARMING_URL, headers=get_headers(), json=data)
            if response.status_code == 204:
                print(f"Operation ({action}) was successful")
            else:
                print(f"Unexpected response: {response.json()}")
        except requests.RequestException as error:
            print(f"Error: {error}")
            if error.response:
                print("Response data:", error.response.json())
                print("Response status:", error.response.status_code)
# # User Credentials for Ajax API
# USERNAME_AJAX = "ramzi.d@outlook.com"
# PASSWORD_AJAX = "3018Bern!"

# # Create a SHA-256 hash of the password
# PASSWORD_HASH_AJAX = hashlib.sha256(PASSWORD_AJAX.encode()).hexdigest()

# login_data_ajax = {
#     "login": USERNAME_AJAX,
#     "passwordHash": PASSWORD_HASH_AJAX,
#     "userRole": "USER"
# }


# # Headers for Ajax API authorization
# headers_ajax = {
#     "X-Api-Key": X_API_KEY,
#     "Content-Type": "application/json",
# }


# def get_session_token():
#     try:
#         response_ajax = requests.post(
#             API_BASE_URL + LOGIN_ENDPOINT,
#             json=login_data_ajax,
#             headers=headers_ajax
#         )

#         # Check if the login was successful
#         if response_ajax.status_code == 200:
#             session_token = response_ajax.json().get("sessionToken")
#             return session_token
#         else:
#             print("Ajax login failed.")
#     except requests.RequestException as error:
#         print("Error logging in to Ajax API:", error)
