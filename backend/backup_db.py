import os
import logging
import shutil
import hashlib
from datetime import datetime
import requests
import asyncio
from configuration import app
from crud_emails import fetch_emails_data
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email_manager import send_email
import sqlite3
import json


# Configuration
DB_PATH = "/home/AdminBST/server/backend/instance/mydatabase.db"
BACKUP_DB_PATH = "/home/AdminBST/server/backend/instance/mydatabase_copy.db"
TOKEN_PATH = "/home/AdminBST/server/backend/token.json"
EMAIL_ADDRESS = "parkingmanagerapp@gmail.com"
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def get_db_hash_excluding_logfile(db_path):
    hash_md5 = hashlib.md5()
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()

    # Exclude data from the "Logfile" table
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name != 'Logfile'"
    )
    tables = [row[0] for row in cursor.fetchall()]

    for table in tables:
        cursor.execute(f"SELECT * FROM {table}")
        for row in cursor.fetchall():
            hash_md5.update(str(row).encode())

    connection.close()
    return hash_md5.hexdigest()


def get_wan_ip():
    try:
        ip = requests.get("https://api.ipify.org").text
    except requests.RequestException:
        ip = "Unknown IP"
    return ip


async def get_email_list():
    email_list = []
    with app.app_context():
        try:
            emails_response = fetch_emails_data()

            # Log the raw response to check its content
            logging.info(f"Raw email response: {emails_response}")

            # Ensure the response is valid and has the correct status code
            if emails_response and emails_response.status_code == 200: # type: ignore

                try:
                    # Get the raw data from the response as text (since it's already a JSON string)
                    response_data = emails_response.get_data(as_text=True) # type: ignore

                    # Now parse the JSON string manually
                    emails_dict = json.loads(response_data)

                    # Process the emails_data if present
                    if emails_dict and 'emails_data' in emails_dict:
                        for email_dict in emails_dict['emails_data']:
                            if 'email' in email_dict:
                                email_list.append(email_dict['email'])
                    else:
                        logging.error(
                            "No 'emails_data' found in the response JSON.")
                except json.JSONDecodeError as e:
                    logging.error(f"Error parsing JSON: {e}")
                except Exception as e:
                    logging.error(
                        f"An error occurred while processing the response: {e}")
            else:
                logging.error(
                    f"Invalid response or status code: {emails_response.status_code}")  # type: ignore

        except Exception as e:
            logging.error(f"Error in get_email_list: {e}")
    print('email list: ', email_list)
    return email_list


async def generate_email(file_path):
    wan_ip = get_wan_ip()
    date_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    creds = None
    email_body = (
        "Hallo!\n"
        f"\nPlease find the database backup of the app 'ParkingManagerApp' server with the IP address: {wan_ip}.\n"
        f"This backup was created at: {date_time}.\n\n"
        "You are receiving a copy of the database because there was a change in the original within the last 12 hours, "
        "and this backup reflects the most recent version.\n\n"
        "Best regards,\nParkingManagerApp Team"
    )

    # Load existing credentials from token.json
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            return  # Exit the function without attempting authentication

    try:
        service = build("gmail", "v1", credentials=creds)
        to_email = await get_email_list()
        if to_email:
            if isinstance(to_email, list):
                to_email = ", ".join(to_email)
            await send_email(
                service,
                EMAIL_ADDRESS,
                to_email,
                f"ParkingManagerApp: {wan_ip} Database Backup",
                email_body,
                file_path,
            )
    except HttpError as error:
        logging.error(f"An error occurred in generate_email: {error}")


async def backup_database():
    if os.path.exists(BACKUP_DB_PATH):
        if get_db_hash_excluding_logfile(DB_PATH) != get_db_hash_excluding_logfile(
            BACKUP_DB_PATH
        ):
            shutil.copy2(DB_PATH, BACKUP_DB_PATH)
            await generate_email(BACKUP_DB_PATH)
        else:
            logging.info("No changes detected. No backup sent.")
    else:
        shutil.copy2(DB_PATH, BACKUP_DB_PATH)
        await generate_email(DB_PATH)


async def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(backup_database, "interval", days=1)

    await backup_database()
    scheduler.start()

    await asyncio.Event().wait()


def start_email_thread():
    asyncio.run(start_scheduler())
