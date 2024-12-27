
from datetime import datetime
from configuration import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from collections import OrderedDict
from sqlalchemy import UniqueConstraint, DateTime

################################################################################################
###################################### CarDataModel##############################################
################################################################################################

# Association table for the many-to-many relationship
car_time_association = db.Table(
    'car_time_association',
    db.Column('car_id', db.Integer, db.ForeignKey(
        'car_data.id', ondelete="CASCADE")),
    db.Column('time_profile_id', db.Integer, db.ForeignKey(
        'time_profile.id', ondelete="CASCADE"))
)


class CarData(db.Model):
    __tablename__ = 'car_data'  # Ensure the table name is correct

    id = db.Column(db.Integer, primary_key=True)
    is_whitelisted = db.Column(db.Boolean, default=False, nullable=False)
    car_licence_plate = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    start_time = db.Column(db.Time, nullable=True)  # HH:MM:SS
    end_time = db.Column(db.Time, nullable=True)    # HH:MM:SS
    # Store as comma-separated string
    days = Column(String(50), nullable=True)

    # Many-to-Many relationship with TimeProfile
    time_profiles = relationship(
        'TimeProfile',
        secondary=car_time_association,
        back_populates='cars',
        passive_deletes=True  # Allows for automatic removal from the association table
    )

    def __init__(self, is_whitelisted, car_licence_plate, first_name, last_name, start_time, end_time, days):
        self.is_whitelisted = is_whitelisted
        self.car_licence_plate = car_licence_plate
        self.first_name = first_name
        self.last_name = last_name
        self.start_time = start_time  # if start_time else datetime.now().time()
        self.end_time = end_time
        # Expecting a comma-separated string
        self.days = days

    def to_json(self):
        return OrderedDict([
            ("id", self.id),
            ("isWhitelisted", self.is_whitelisted),
            ("carLicencePlate", self.car_licence_plate),
            ("firstName", self.first_name),
            ("lastName", self.last_name),
            ("accessTime", {
                "startTime": self.start_time.strftime("%H:%M")if self.start_time else None,
                "endTime": self.end_time.strftime("%H:%M")if self.end_time else None
            }),
            ("days", self.days.split(',')),  # Convert to list
            # Provide only the necessary fields for the time profiles
            ("timeProfiles", [{"id": profile.id, "title": profile.title}
             for profile in self.time_profiles])
        ])


class TimeProfile(db.Model):
    __tablename__ = 'time_profile'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    end_time = db.Column(db.Time, nullable=True)

    # Many-to-Many relationship with CarData
    cars = relationship(
        'CarData',
        secondary=car_time_association,
        back_populates='time_profiles',
        passive_deletes=True
    )

    def __init__(self, title, start_date, start_time, end_date=None, end_time=None):
        self.title = title
        self.start_date = start_date
        self.start_time = start_time
        self.end_date = end_date
        self.end_time = end_time

    def to_json(self):
        return OrderedDict([
            ("id", self.id),
            ("title", self.title),
            ("startDate", self.start_date.strftime('%d.%m.%Y')),  # Swiss format
            ("startTime", self.start_time.strftime("%H:%M")),
            ("endDate", self.end_date.strftime('%d.%m.%Y')
             if self.end_date else None),  # Swiss format
            ("endTime", self.end_time.strftime("%H:%M") if self.end_time else None),
            ("cars", [car.to_json() for car in self.cars])
        ])


################################################################################################
###################################### UserModel#################################################
################################################################################################
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=False)
    last_name = db.Column(db.String(80), unique=False)
    email = db.Column(db.String(80), unique=True,
                      nullable=False)  # Email address
    password_hash = db.Column(db.String(120), nullable=True)  # Password hash
    status = db.Column(db.String(20), default='inactive', nullable=False)

    def __init__(self, first_name, last_name, email, password=None, status='inactive'):
        self.first_name = first_name.capitalize()
        self.last_name = last_name.capitalize()
        self.email = email.lower()  # Ensure email is stored in lowercase
        if password:
            self.password_hash = generate_password_hash(password)
        self.status = status

    def check_password(self, password):
        return self.password_hash and check_password_hash(self.password_hash, password)

    def to_json(self):
        return OrderedDict([
            ("id", self.id),
            ('first_name', self.first_name),
            ('last_name', self.last_name),
            ("email", self.email),
            ("status", self.status),
        ])

################################################################################################
###################################### SubUserModel##############################################
################################################################################################


class SubUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=False)
    last_name = db.Column(db.String(80), unique=False)
    email = db.Column(db.String(80), nullable=False,
                      unique=True)  # Email address
    password_hash = db.Column(db.String(120), nullable=True)  # Password hash
    status = db.Column(db.String(20), default='inactive', nullable=False)

    def __init__(self, first_name, last_name, email, password=None, status='inactive'):
        self.first_name = first_name.capitalize()
        self.last_name = last_name.capitalize()
        self.email = email.lower()  # Ensure email is stored in lowercase
        if password:
            self.password_hash = generate_password_hash(password)
        self.status = status

    def check_password(self, password):
        if self.password_hash is None:
            return False
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return OrderedDict([
            ("id", self.id),
            ('first_name', self.first_name),
            ('last_name', self.last_name),
            ("email", self.email),
            ("status", self.status)
        ])
# ################################################################################
############################# EmailModel   #######################################


class Email(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=False, nullable=True)
    last_name = db.Column(db.String(80), unique=False, nullable=True)
    email = db.Column(db.String(80), unique=True,
                      nullable=False)

    def __init__(self, email, first_name=None, last_name=None):
        self.first_name = first_name.capitalize() if first_name else first_name
        self.last_name = last_name.capitalize() if last_name else last_name
        self.email = email.lower()  # Ensure email is stored in lowercase

    def to_json(self):
        return OrderedDict([
            ("id", self.id),
            ('first_name', self.first_name),
            ('last_name', self.last_name),
            ("email", self.email),
        ])

# 3
################################# log file #########################################################
####################################################################################################


class LogFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plate = db.Column(db.String(80), unique=False, nullable=False)
    got_access = db.Column(db.Boolean, default=False, nullable=False)
    creation_time = db.Column(db.String, nullable=False)  

    def __init__(self, plate, got_access):
        self.plate = plate.upper()
        self.got_access = got_access
        self.creation_time = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    def to_json(self):
        return OrderedDict([
            ("id", self.id),
            ("plate", self.plate),
            ("got_access", self.got_access),
            ("creation_time", self.creation_time)
        ])