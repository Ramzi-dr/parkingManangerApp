# flask server have to be protected with user and pass for that u have to add them to the envirenment file:
# nano ~/.bashrc
# export VARIABLE_NAME="variable_value"


import os
from flask import Response, request
from functools import wraps

USERNAME = os.getenv('FLASK_USERNAME')
PASSWORD = os.getenv('FLASK_PASSWORD')
ALARM_USER = 'ajaxuser'
ALARM_PASS = 'ajaxpass'


def check_auth(username, password, alarm=None):
    """Check if a username and password combination is valid."""
    if alarm:
        return username == ALARM_USER and password == ALARM_PASS

    return username == USERNAME and password == PASSWORD


def authenticate():
    """Send a 401 response that enables basic auth."""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})


# Original requires_auth without alarm argument (unchanged)
def requires_auth(f):
    """Decorator to require authentication for a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

# New decorator for routes that require alarm-specific authentication
def requires_alarm_auth(f):
    """Decorator to require authentication for alarm system routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password, alarm=True):
            return authenticate()
        return f(*args, **kwargs)
    return decorated


