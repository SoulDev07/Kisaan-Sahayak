# Crop Disease Detection Feature

## Overview
The Crop Disease Detection feature analyzes uploaded images of crops to identify diseases, providing farmers with detailed information about the detected issues and actionable solutions. This feature uses advanced AI vision capabilities to accurately detect and locate diseased regions within crop images.

## Components

### Router: `crop_disease.py`
Handles HTTP endpoints for crop disease detection:
- **POST `/crop-disease/detect`**: Accepts crop images and returns detailed disease analysis.

### Service: `crop_disease.py`
Implements the core disease detection functionality:
- **analyze_crop_image()**: Processes uploaded images using the Gemini 2.5 Flash multimodal model to detect crop diseases.

## Technical Details
- Uses Google Gemini 2.5 Flash for multimodal image analysis
- Standardizes images to 512x512 pixels
- Implements structured output parsing using Pydantic
- Provides precise bounding box coordinates for diseased regions
- Returns confidence scores for disease detection
- Includes few-shot examples to improve response quality

## Output Format
The service returns a structured response with:
- **diseaseName**: Precise identification of the detected disease
- **confidence**: Confidence score as a percentage (0-100)
- **boundingBoxes**: Coordinates of diseased regions (x, y, width, height as percentages)
- **boundingBoxExplanation**: Explanation of how bounding boxes were determined
- **description**: Detailed description of the disease and visual symptoms
- **symptoms**: List of disease symptoms
- **solutions**: List of actionable solutions with title and details

## Prompt Improvement
The existing prompt could be enhanced by:

1. **Indian Crop Specificity**: Include more Indian-specific crop diseases and varieties common in different regions.
2. **Regional Treatment Options**: Add region-specific treatment options based on locally available products and methods.
3. **Disease Progression**: Include information about disease progression stages and timing for interventions.
4. **Weather Correlation**: Add context about weather conditions that might exacerbate the detected diseases.
5. **Prevention Strategies**: Enhance solutions to include more preventative measures for future crops.
6. **Disease Confusion Sets**: Add more details about visually similar diseases to help differentiate between them.

## Usage Example
```python
# Example of using the Crop Disease API
import requests
import base64

url = "https://api.kisankiawaaz.com/crop-disease/detect"
image_path = "crop_image.jpg"

with open(image_path, "rb") as image_file:
    files = {"image": image_file}
    response = requests.post(url, files=files)
    
result = response.json()
print(f"Detected: {result['diseaseName']} (Confidence: {result['confidence']}%)")
print("Description:", result['description'])
print("Symptoms:", ", ".join(result['symptoms']))
print("\nSolutions:")
for solution in result['solutions']:
    print(f"- {solution['title']}: {solution['details']}")
``` 