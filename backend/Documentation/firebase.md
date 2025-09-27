# Firebase Service

## Overview
The Firebase Service provides core database and storage functionality for the Kisan Ki Awaaz application. It initializes and manages connections to Firebase Firestore for document storage and Firebase Storage for file management. This service acts as a central integration point for all Firebase-related operations throughout the application.

## Components

### Service: `firebase.py`
Core Firebase integration functionality:
- **Firestore Client**: Provides access to the Firestore database for document operations
- **Storage Integration**: Handles image uploads to Firebase Storage
- **Authentication**: Sets up service account credentials for secure Firebase access

### Key Functions
- **upload_image_base64_to_storage()**: Converts base64-encoded images to files and uploads them to Firebase Storage with appropriate permissions

## Technical Details
- Uses Firebase Admin SDK for server-side operations
- Implements Google Cloud Storage for file management
- Configures service account authentication for secure access
- Provides a singleton database client instance for consistent access across the application
- Manages file uploads with appropriate content types and permissions

## Integration Points
The Firebase service is used by multiple features:
1. **Farmer Feature**: For storing and retrieving farmer profiles and related data
2. **Rental Feature**: For managing equipment listings and bookings
3. **Market Feature**: For storing market price data
4. **Weather Feature**: For caching weather information
5. **Soil Moisture Feature**: For storing soil moisture readings
6. **Document Builder**: For storing generated documents

## Implementation Considerations
When using the Firebase service:
- Always handle exceptions appropriately as network operations may fail
- Consider data structure design to optimize query performance
- Be mindful of Firestore's document size limitations (1MB per document)
- Use batch operations for multiple document updates
- Follow security best practices for service account credential management

## Usage Example
```python
# Example of using the Firebase service
from services.firebase import db, upload_image_base64_to_storage

# Read a document
farmer_ref = db.collection('farmers').document('farmer123')
farmer_doc = farmer_ref.get()
if farmer_doc.exists:
    farmer_data = farmer_doc.to_dict()
    print(f"Farmer name: {farmer_data.get('name')}")

# Write a document
new_crop = {
    'name': 'Wheat',
    'variety': 'HD-2967',
    'plantingDate': '2023-11-15'
}
db.collection('farmers').document('farmer123').collection('crops').add(new_crop)

# Upload an image
base64_image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."  # Truncated for brevity
image_url = upload_image_base64_to_storage(base64_image, 'farmer123')
print(f"Uploaded image URL: {image_url}")
``` 