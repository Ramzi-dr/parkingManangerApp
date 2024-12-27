import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import base64
from googleapiclient.errors import HttpError

async def send_email(service, sender, to, subject, message_text, file_path):
    message = MIMEMultipart()
    message["to"] = to
    message["from"] = sender
    message["subject"] = subject
    message.attach(MIMEText(message_text))

    with open(file_path, "rb") as attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition",
                        f"attachment; filename={os.path.basename(file_path)}")
        message.attach(part)

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    body = {"raw": raw_message}

    try:
        message = service.users().messages().send(userId="me", body=body).execute()
    except HttpError as error:
        print(f"An error occurred: {error}")
