from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def generate_token():
    flow = InstalledAppFlow.from_client_secrets_file(
        "credentials.json", SCOPES)
    creds = flow.run_local_server(
        port=0, access_type='offline', prompt='consent')
    with open("token.json", "w") as token_file:
        token_file.write(creds.to_json())


if __name__ == "__main__":
    generate_token()
