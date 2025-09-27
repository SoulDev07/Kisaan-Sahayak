from fastapi import APIRouter, UploadFile, File, HTTPException
from services.crop_disease import analyze_crop_image

router = APIRouter()

@router.post("/crop-disease/detect")
def detect_crop_disease(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    try:
        image_bytes = image.file.read()
        result = analyze_crop_image(image_bytes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        # Known failure from analysis pipeline
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        # Generic fallback without leaking internals
        raise HTTPException(status_code=500, detail="Internal server error during crop analysis")