# THIS IS CONFIG FILE TO CONFIG FLASK APP

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS
import eventlet
from flask_migrate import Migrate
import secrets
from datetime import timedelta




# Flask application setup
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
    True  # have to be True in real working app
)

app.secret_key = secrets.token_hex(16)  # Generates a random 32-character hexadecimal
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=3)
db = SQLAlchemy()

# migrate = Migrate(app, db)
db.init_app(app)
CORS(app, supports_credentials=True)
socket_io = SocketIO(app, cors_allowed_origins="*")

