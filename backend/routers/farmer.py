from fastapi import APIRouter, HTTPException, Body, UploadFile, File
from services.firebase import db
from services.gemini import analyze_image_with_context
import base64
import uuid
from models.farmer import Farmer, FarmerProfile, Livestock, Crop, CalendarEvent, MarketListing, ChatHistory, Document, Vectors
from typing import List, Dict, Any
from services.chat_rag import model as gemini_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

# --- GET endpoints (already present) ---
@router.get("/farmer/{farmer_id}")
def get_farmer(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    data['farmerId'] = farmer_id
    return data

@router.get("/farmer/{farmer_id}/profile")
def get_farmer_profile(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    profile_fields = [
        'name', 'profileImage', 'village', 'phoneNumber', 'language',
        'farmLocation', 'farmSize', 'preferredInteractionMode', 'onboardingStatus'
    ]
    profile = {k: data.get(k) for k in profile_fields}
    profile['farmerId'] = farmer_id
    return profile

@router.put("/farmer/{farmer_id}/profile")
def update_farmer_profile(farmer_id: str, profile: dict = Body(...)):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    doc_ref.update({'profile': profile})
    return {"message": "Profile updated", "profile": profile}

@router.get("/farmer/{farmer_id}/livestock")
def get_farmer_livestock(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    return data.get('livestock', [])

@router.get("/farmer/{farmer_id}/crops")
def get_farmer_crops(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    return data.get('crops', [])

@router.get("/farmer/{farmer_id}/calendar")
def get_farmer_calendar(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    return data.get('calendarEvents', [])

@router.get("/farmer/{farmer_id}/market")
def get_farmer_market(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    return data.get('marketListings', [])

@router.get("/farmer/{farmer_id}/chat")
def get_farmer_chat_history(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    return data.get('chatHistory', [])

@router.get("/farmer/{farmer_id}/documents")
def get_farmer_documents(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    return data.get('documents', [])

@router.get("/farmer/{farmer_id}/vectors")
def get_farmer_vectors(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    return data.get('vectors', {})

@router.get("/farmer/{farmer_id}/calendar/ai-analysis")
def get_calendar_ai_analysis(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    events = data.get('calendarEvents', [])
    if not events:
        return {"analysis": "No calendar events found."}
    # Build prompt for Gemini
    events_md = '\n'.join([
        f"- **{ev.get('date', '')}**: {ev.get('task', '')} ({ev.get('details', '')})" for ev in events
    ])
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert farm assistant. Analyze the following farmer's calendar events and generate a helpful, concise summary and actionable insights for the upcoming week. Use bullet points, markdown, and be specific. Always answer in English. If there are important tasks, highlight them. If there are gaps or suggestions, mention them. Do not greet, just start with the analysis. By default, summarize in no more than 4 bullet points unless asked for more detail."),
        ("human", "Farmer's calendar events:\n{events_md}\n\nGenerate an AI analysis for the upcoming week in markdown.")
    ])
    chain = prompt | gemini_model | StrOutputParser()
    analysis = chain.invoke({"events_md": events_md})
    return {"analysis": analysis}

# --- POST endpoints ---
@router.post("/farmer", response_model=Dict[str, Any])
def create_farmer(farmer: Farmer):
    doc_ref = db.collection('farmers').document(farmer.farmerId)
    doc_ref.set(farmer.dict(exclude={'farmerId'}))
    return {"message": "Farmer created", "farmerId": farmer.farmerId}

@router.post("/farmer/{farmer_id}/livestock", response_model=Dict[str, Any])
def add_livestock(farmer_id: str, livestock: Livestock):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    livestock_list = data.get('livestock', [])
    livestock_list.append(livestock.dict())
    doc_ref.update({'livestock': livestock_list})
    return {"message": "Livestock added"}

@router.post("/farmer/{farmer_id}/crops", response_model=Dict[str, Any])
def add_crop(farmer_id: str, crop: Crop):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    crops = data.get('crops', [])
    crops.append(crop.dict())
    doc_ref.update({'crops': crops})
    return {"message": "Crop added"}

@router.post("/farmer/{farmer_id}/calendar", response_model=Dict[str, Any])
def add_calendar_event(farmer_id: str, event: CalendarEvent):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    events = data.get('calendarEvents', [])
    events.append(event.dict())
    doc_ref.update({'calendarEvents': events})
    return {"message": "Calendar event added"}

@router.post("/farmer/{farmer_id}/market", response_model=Dict[str, Any])
def add_market_listing(farmer_id: str, listing: MarketListing):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    listings = data.get('marketListings', [])
    listings.append(listing.dict())
    doc_ref.update({'marketListings': listings})
    return {"message": "Market listing added"}

@router.post("/farmer/{farmer_id}/chat", response_model=Dict[str, Any])
def add_chat_history(farmer_id: str, chat: ChatHistory):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    chats = data.get('chatHistory', [])
    chats.append(chat.dict())
    doc_ref.update({'chatHistory': chats})
    return {"message": "Chat history added"}

@router.post("/farmer/{farmer_id}/documents", response_model=Dict[str, Any])
def add_document(farmer_id: str, document: Document):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    documrents = data.get('documents', [])
    documents.append(document.dict())
    doc_ref.update({'documents': documents})
    return {"message": "Document added"}

@router.post("/farmer/{farmer_id}/vectors", response_model=Dict[str, Any])
def set_vectors(farmer_id: str, vectors: Vectors):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    doc_ref.update({'vectors': vectors.dict()})
    return {"message": "Vectors updated"}

@router.post("/farmer/{farmer_id}/space-suggestions")
def add_space_suggestions(farmer_id: str, body: Dict[str, Any] = Body(...)):
    """
    Accepts: { image: base64, animals: [...], calendar: [...] }
    Stores the image as base64 in Firestore, calls Gemini with base64, and returns suggestions.
    """
    image_base64 = body.get('image')
    animals = body.get('animals', [])
    calendar = body.get('calendar', [])
    if not image_base64:
        raise HTTPException(status_code=400, detail="Image is required")
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    # Prepare context string
    context = f"Animals: {animals}\nCalendar: {calendar}"
    # Call Gemini with the image
    suggestions = analyze_image_with_context(image_base64, context)
    # Update DB: store image and suggestions
    doc_ref.update({
        'spaceImage_latest': image_base64,
        'spaceSuggestions': suggestions
    })
    return { 'suggestions': suggestions }

# --- PUT endpoints (update by id) ---
@router.put("/farmer/{farmer_id}/livestock/{item_id}", response_model=Dict[str, Any])
def update_livestock(farmer_id: str, item_id: str, livestock: Livestock):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    livestock_list = data.get('livestock', [])
    updated = False
    for i, item in enumerate(livestock_list):
        if item.get('id') == item_id:
            livestock_list[i] = livestock.dict()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Livestock not found")
    doc_ref.update({'livestock': livestock_list})
    return {"message": "Livestock updated"}

@router.put("/farmer/{farmer_id}/crops/{crop_id}", response_model=Dict[str, Any])
def update_crop(farmer_id: str, crop_id: str, crop: Crop):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    crops = data.get('crops', [])
    updated = False
    for i, item in enumerate(crops):
        if item.get('cropId') == crop_id:
            crops[i] = crop.dict()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Crop not found")
    doc_ref.update({'crops': crops})
    return {"message": "Crop updated"}

@router.put("/farmer/{farmer_id}/calendar/{event_id}", response_model=Dict[str, Any])
def update_calendar_event(farmer_id: str, event_id: str, event: CalendarEvent):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    events = data.get('calendarEvents', [])
    updated = False
    for i, item in enumerate(events):
        if item.get('task') == event_id:
            events[i] = event.dict()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    doc_ref.update({'calendarEvents': events})
    return {"message": "Calendar event updated"}

@router.put("/farmer/{farmer_id}/market/{listing_id}", response_model=Dict[str, Any])
def update_market_listing(farmer_id: str, listing_id: str, listing: MarketListing):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    listings = data.get('marketListings', [])
    updated = False
    for i, item in enumerate(listings):
        if item.get('id') == listing_id:
            listings[i] = listing.dict()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Market listing not found")
    doc_ref.update({'marketListings': listings})
    return {"message": "Market listing updated"}

@router.put("/farmer/{farmer_id}/chat/{chat_id}", response_model=Dict[str, Any])
def update_chat_history(farmer_id: str, chat_id: str, chat: ChatHistory):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    chats = data.get('chatHistory', [])
    updated = False
    for i, item in enumerate(chats):
        if item.get('id') == chat_id:
            chats[i] = chat.dict()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Chat history not found")
    doc_ref.update({'chatHistory': chats})
    return {"message": "Chat history updated"}

@router.put("/farmer/{farmer_id}/documents/{doc_id}", response_model=Dict[str, Any])
def update_document(farmer_id: str, doc_id: str, document: Document):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    documents = data.get('documents', [])
    updated = False
    for i, item in enumerate(documents):
        if item.get('id') == doc_id:
            documents[i] = document.dict()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    doc_ref.update({'documents': documents})
    return {"message": "Document updated"}

@router.put("/farmer/{farmer_id}/vectors", response_model=Dict[str, Any])
def update_vectors(farmer_id: str, vectors: Vectors):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    doc_ref.update({'vectors': vectors.dict()})
    return {"message": "Vectors updated"}

# --- DELETE endpoints (remove by id) ---
@router.delete("/farmer/{farmer_id}/livestock/{item_id}", response_model=Dict[str, Any])
def delete_livestock(farmer_id: str, item_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    livestock_list = data.get('livestock', [])
    new_list = [item for item in livestock_list if item.get('id') != item_id]
    if len(new_list) == len(livestock_list):
        raise HTTPException(status_code=404, detail="Livestock not found")
    doc_ref.update({'livestock': new_list})
    return {"message": "Livestock deleted"}

@router.delete("/farmer/{farmer_id}/crops/{crop_id}", response_model=Dict[str, Any])
def delete_crop(farmer_id: str, crop_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    crops = data.get('crops', [])
    new_list = [item for item in crops if item.get('cropId') != crop_id]
    if len(new_list) == len(crops):
        raise HTTPException(status_code=404, detail="Crop not found")
    doc_ref.update({'crops': new_list})
    return {"message": "Crop deleted"}

@router.delete("/farmer/{farmer_id}/calendar/{event_id}", response_model=Dict[str, Any])
def delete_calendar_event(farmer_id: str, event_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    events = data.get('calendarEvents', [])
    new_list = [item for item in events if item.get('task') != event_id]
    if len(new_list) == len(events):
        raise HTTPException(status_code=404, detail="Calendar event not found")
    doc_ref.update({'calendarEvents': new_list})
    return {"message": "Calendar event deleted"}

@router.delete("/farmer/{farmer_id}/market/{listing_id}", response_model=Dict[str, Any])
def delete_market_listing(farmer_id: str, listing_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    listings = data.get('marketListings', [])
    new_list = [item for item in listings if item.get('id') != listing_id]
    if len(new_list) == len(listings):
        raise HTTPException(status_code=404, detail="Market listing not found")
    doc_ref.update({'marketListings': new_list})
    return {"message": "Market listing deleted"}

@router.delete("/farmer/{farmer_id}/chat/{chat_id}", response_model=Dict[str, Any])
def delete_chat_history(farmer_id: str, chat_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    chats = data.get('chatHistory', [])
    new_list = [item for item in chats if item.get('id') != chat_id]
    if len(new_list) == len(chats):
        raise HTTPException(status_code=404, detail="Chat history not found")
    doc_ref.update({'chatHistory': new_list})
    return {"message": "Chat history deleted"}

@router.delete("/farmer/{farmer_id}/documents/{doc_id}", response_model=Dict[str, Any])
def delete_document(farmer_id: str, doc_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    documents = data.get('documents', [])
    new_list = [item for item in documents if item.get('id') != doc_id]
    if len(new_list) == len(documents):
        raise HTTPException(status_code=404, detail="Document not found")
    doc_ref.update({'documents': new_list})
    return {"message": "Document deleted"}

@router.delete("/farmer/{farmer_id}/vectors", response_model=Dict[str, Any])
def delete_vectors(farmer_id: str):
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    doc_ref.update({'vectors': firestore.DELETE_FIELD})
    return {"message": "Vectors deleted"} 