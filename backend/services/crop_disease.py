import base64
import os
from typing import Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import httpx
import logging
from PIL import Image
import io

# --- Gemini 2.5 Flash Model Setup ---
GOOGLE_API_KEY = "AIzaSyBhI1O9Bj_oUsM9HP1u7FlOLYIlKK9Dgt4"
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY)

# --- Pydantic Model for Output ---
class BoundingBox(BaseModel):
    x: float = Field(description="X position (percent, 0-100)")
    y: float = Field(description="Y position (percent, 0-100)")
    width: float = Field(description="Width (percent, 0-100)")
    height: float = Field(description="Height (percent, 0-100)")

class DiseaseDetection(BaseModel):
    diseaseName: str = Field(description="Name of the detected disease")
    confidence: float = Field(description="Confidence score (0-100)")
    boundingBoxes: List[BoundingBox] = Field(description="List of bounding boxes for all detected diseased regions, each as an object with x, y, width, height (all floats, percent)")
    boundingBoxExplanation: str = Field(description="Short explanation of how the bounding boxes were determined")
    description: str = Field(description="Detailed description of the disease and any ambiguity if present")
    symptoms: list = Field(description="List of symptoms")
    solutions: list = Field(description="List of actionable solutions, each as a dict with title and details")

parser = PydanticOutputParser(pydantic_object=DiseaseDetection)

# --- Enhanced Prompt Template with Few-Shot Example ---
FIXED_WIDTH = 512
FIXED_HEIGHT = 512
FEW_SHOT_EXAMPLES = '''
Example 1 (multiple regions):
{{
  "diseaseName": "Leaf Spot",
  "confidence": 91.2,
  "boundingBoxes": [
    {{"x": 12.5, "y": 20.0, "width": 15.0, "height": 18.0}},
    {{"x": 60.0, "y": 40.0, "width": 10.0, "height": 12.0}}
  ],
  "boundingBoxExplanation": "Two distinct necrotic regions detected.",
  "description": "Multiple brown spots typical of leaf spot disease.",
  "symptoms": ["Brown lesions", "Yellow halos"],
  "solutions": [
    {{"title": "Remove affected leaves", "details": "Prune and destroy affected leaves."}},
    {{"title": "Apply fungicide", "details": "Use a broad-spectrum fungicide."}}
  ]
}}

Example 2 (healthy):
{{
  "diseaseName": "Healthy",
  "confidence": 100.0,
  "boundingBoxes": [
    {{"x": 0.0, "y": 0.0, "width": 100.0, "height": 100.0}}
  ],
  "boundingBoxExplanation": "No diseased regions detected, box covers whole image.",
  "description": "No visible symptoms of disease.",
  "symptoms": [],
  "solutions": []
}}
'''

# Enhanced prompt template for Indian agriculture context
INDIAN_CROPS = ["rice/धान/चावल", "wheat/गेहूँ", "cotton/कपास", "sugarcane/गन्ना", 
               "maize/मक्का", "pulses/दालें", "soybeans/सोयाबीन", "mustard/सरसों", 
               "groundnut/मूंगफली", "millet/बाजरा", "potato/आलू", "tomato/टमाटर"]

COMMON_DISEASES = ["blast/ब्लास्ट", "blight/झुलसा", "rust/रतुआ", "powdery mildew/चूर्णिल फफूंदी", 
                  "leaf spot/पत्ती धब्बा", "root rot/जड़ सड़न", "wilt/मुरझान", 
                  "mosaic virus/मोज़ेक वायरस", "bacterial leaf streak/जीवाणु पत्ती धारी"]

prompt = ChatPromptTemplate.from_messages([
    ("system", (
        f"You are an expert agricultural disease detection system specialized in Indian crops. "
        f"Given a crop image that has been resized to exactly {FIXED_WIDTH}x{FIXED_HEIGHT} pixels, analyze and return a detailed JSON response.\n\n"
        
        f"INDIAN AGRICULTURE CONTEXT:\n"
        f"Focus on crops common in India: {', '.join(INDIAN_CROPS)}.\n"
        f"Be familiar with diseases prevalent in Indian agricultural regions: {', '.join(COMMON_DISEASES)}.\n"
        f"Consider regional farming practices, climate zones (tropical, subtropical, arid), and monsoon effects.\n\n"
        
        f"DETECTION REQUIREMENTS:\n"
        f"1. Identify the crop type if possible.\n"
        f"2. Determine the specific disease with highest confidence.\n"
        f"3. Mark ALL affected regions with precise bounding boxes.\n"
        f"4. Provide India-specific treatment options using locally available products.\n\n"
        
        f"OUTPUT FORMAT:\n"
        f"Return a JSON object with these fields:\n"
        f"- diseaseName: Precise name of the detected disease in English and Hindi if possible\n"
        f"- confidence: Confidence score as percentage (float, 0-100)\n"
        f"- boundingBoxes: Array of objects with x, y, width, height as percentages (0-100) for each affected region\n"
        f"- boundingBoxExplanation: Brief explanation of how boxes were determined\n"
        f"- description: Detailed description including crop type, disease specifics, growth stage implications\n"
        f"- symptoms: Array of observable symptoms\n"
        f"- solutions: Array of objects with title and details, prioritizing:\n"
        f"  * Low-cost solutions available to small farmers\n"
        f"  * Organic/natural remedies when possible\n"
        f"  * Specific product names available in Indian markets\n"
        f"  * Application rates and methods\n"
        f"  * Preventative measures for future seasons\n\n"
        
        f"IMPORTANT NOTES:\n"
        f"- If the crop appears healthy, set diseaseName to 'Healthy' and use a single bounding box covering the whole image.\n"
        f"- If disease is detected but ambiguous, mention all possibilities in the description but select the most likely for diseaseName.\n"
        f"- Never return empty boundingBoxes array. Always provide at least one box.\n"
        f"- Include local/Hindi names for diseases when possible alongside scientific names.\n"
        f"- For solutions, reference specific products available in India rather than generic solutions.\n\n"
        
        + FEW_SHOT_EXAMPLES +
        "\n\n{format_instructions}"
    )),
    ("human", [
        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,{image_data}"}},
    ]),
])

chain = prompt | model | parser

def analyze_crop_image(image_bytes: bytes) -> dict:
  # Validate input
  if not image_bytes:
    raise ValueError("Empty image bytes provided to analyze_crop_image")

  try:
    # Resize image to fixed size
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((FIXED_WIDTH, FIXED_HEIGHT))
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    resized_bytes = buf.getvalue()
    image_data = base64.b64encode(resized_bytes).decode("utf-8")

    # Call the multimodal chain
    result = chain.invoke({
      "format_instructions": parser.get_format_instructions(),
      "image_data": image_data,
      "x": 0  # Provide a default value for 'x' to satisfy the prompt template
    })

    logging.info(f"Gemini raw response: {result}")

    # Handle possible return types from the chain:
    # - Pydantic model with .dict()
    # - dict
    # - object with .to_dict() or .dict()
    # - JSON string
    if hasattr(result, "dict") and callable(getattr(result, "dict")):
      parsed = result.dict()
      logging.info("Parsed result via .dict()")
      return parsed

    if hasattr(result, "to_dict") and callable(getattr(result, "to_dict")):
      parsed = result.to_dict()
      logging.info("Parsed result via .to_dict()")
      return parsed

    if isinstance(result, dict):
      logging.info("Result is already a dict")
      return result

    # Try parsing JSON string
    if isinstance(result, str):
      import json
      try:
        parsed = json.loads(result)
        logging.info("Parsed result from JSON string")
        return parsed
      except Exception:
        logging.warning("Result is a string but not valid JSON; returning raw string in dict")
        return {"result": result}

    # Fallback: return string representation
    logging.warning("Unhandled result type from chain; returning string representation")
    return {"result": str(result)}

  except Exception as e:
    logging.exception("Error in analyze_crop_image: %s", e)
    # raise with a clearer message for the router to pass along
    raise RuntimeError(f"analyze_crop_image failed: {e}") from e