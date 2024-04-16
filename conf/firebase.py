import pyrebase
import firebase_admin
from firebase_admin import credentials, firestore as db
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Firebase configuration
config = {
    "apiKey": os.getenv('FIREBASE_API_KEY'),
    "authDomain": os.getenv('FIREBASE_AUTH_DOMAIN'),
    "projectId": os.getenv('FIREBASE_PROJECT_ID'),
    "storageBucket": os.getenv('FIREBASE_STORAGE_BUCKET'),
    "messagingSenderId": os.getenv('FIREBASE_MESSAGING_SENDER_ID'),
    "appId": os.getenv('FIREBASE_APP_ID'),
    "databaseURL": "",
}

# Initialize Firebase
firebase = pyrebase.initialize_app(config)

# Initialize Firebase Authentication
auth = firebase.auth()

# Initialize Firebase Storage
# storage = firebase.storage()

# Initialize Firebase only if it's not already initialized
# Load the credentials from the file
with open('credentials.json', 'r') as temp_file:
    file = json.load(temp_file)

# Use the credentials
cred = credentials.Certificate(file)

if not firebase_admin._apps:
    app = firebase_admin.initialize_app(cred)

# Initialize Firebase Firestore
firestore = db.client(app)
