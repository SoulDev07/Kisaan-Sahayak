import firebase_admin
from firebase_admin import credentials, firestore
import os
from google.cloud import storage
import base64
import uuid

SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', 'creds', 'serviceAccountKey.json')

# Ensure GOOGLE_APPLICATION_CREDENTIALS is set for Google Cloud Storage
if not os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(SERVICE_ACCOUNT_PATH)

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
db = firestore.client()

def upload_image_base64_to_storage(base64_str, farmer_id):
    """
    Uploads a base64 image to Firebase Storage and returns the public download URL.
    """
    bucket = storage.Client().bucket('kisankiawaz-bd1a9.appspot.com')  # Replace with your bucket name
    image_id = str(uuid.uuid4())
    blob_path = f'farmers/{farmer_id}/spaceImages/{image_id}.jpg'
    blob = bucket.blob(blob_path)
    image_bytes = base64.b64decode(base64_str)
    blob.upload_from_string(image_bytes, content_type='image/jpeg')
    blob.make_public()
    return blob.public_url 