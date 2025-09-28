from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import random, datetime

# -------------------------------
# Firebase Initialization
# -------------------------------
cred = credentials.Certificate("serviceAccountKey.json")  # Firebase service account JSON
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

# -------------------------------
# POST route for OTP login
# -------------------------------
@app.route('/api/login/otp', methods=['POST'])
def login_with_otp():
    data = request.get_json()
    phone_number = data.get("phone")

    if not phone_number:
        return jsonify({"error": "Phone number required"}), 400

    # Generate 6-digit OTP
    otp = random.randint(100000, 999999)

    # Store OTP in Firestore with expiry (say 5 mins)
    db.collection("otps").document(phone_number).set({
        "otp": str(otp),
        "created_at": datetime.datetime.utcnow(),
        "expires_at": datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        "verified": False
    })

    # Normally you'd send OTP via Twilio / Firebase SMS
    # For demo, return OTP in response
    return jsonify({"message": "OTP generated successfully", "otp": otp})


# -------------------------------
# POST route to verify OTP
# -------------------------------
@app.route('/api/login/verify', methods=['POST'])
def verify_otp():
    data = request.get_json()
    phone_number = data.get("phone")
    entered_otp = data.get("otp")

    if not phone_number or not entered_otp:
        return jsonify({"error": "Phone and OTP required"}), 400

    otp_doc = db.collection("otps").document(phone_number).get()
    if not otp_doc.exists:
        return jsonify({"error": "No OTP request found"}), 404

    otp_data = otp_doc.to_dict()
    if otp_data["verified"]:
        return jsonify({"error": "OTP already used"}), 400

    if datetime.datetime.utcnow() > otp_data["expires_at"]:
        return jsonify({"error": "OTP expired"}), 400

    if otp_data["otp"] != entered_otp:
        return jsonify({"error": "Invalid OTP"}), 401

    # Mark OTP as used
    db.collection("otps").document(phone_number).update({"verified": True})

    # Create session (for demo, return a fake JWT token)
    fake_jwt = f"TOKEN-{phone_number}"

    return jsonify({"message": "OTP verified successfully", "token": fake_jwt})


if __name__ == "__main__":
    app.run(debug=True)
