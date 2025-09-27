from fastapi import HTTPException, Body, UploadFile, File
from services.firebase import db
from services.gemini import analyze_image_with_context
import base64
import uuid
from models.farmer import Farmer, FarmerProfile, Livestock, Crop, CalendarEvent, MarketListing, ChatHistory, Document, Vectors
from typing import List, Dict, Any
from services.chat_rag import model as gemini_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from google.cloud import firestore # Import firestore for DELETE_FIELD

class FarmerService:
    def __init__(self):
        self.db = db # Assuming db is a singleton or can be accessed directly

    def get_farmer(self, farmer_id: str):
        """
        Retrieves a farmer's complete data by their ID.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        data['farmerId'] = farmer_id
        return data

    def get_farmer_profile(self, farmer_id: str):
        """
        Retrieves a farmer's profile information by their ID.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
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

    def update_farmer_profile(self, farmer_id: str, profile: dict = Body(...)):
        """
        Updates a farmer's profile information.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        doc_ref.update({'profile': profile})
        return {"message": "Profile updated", "profile": profile}

    def get_farmer_livestock(self, farmer_id: str):
        """
        Retrieves the list of livestock for a given farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        return data.get('livestock', [])

    def get_farmer_crops(self, farmer_id: str):
        """
        Retrieves the list of crops for a given farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        return data.get('crops', [])

    def get_farmer_calendar(self, farmer_id: str):
        """
        Retrieves the calendar events for a given farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        return data.get('calendarEvents', [])

    def get_farmer_market(self, farmer_id: str):
        """
        Retrieves the market listings for a given farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        return data.get('marketListings', [])

    def get_farmer_chat_history(self, farmer_id: str):
        """
        Retrieves the chat history for a given farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        return data.get('chatHistory', [])

    def get_farmer_documents(self, farmer_id: str):
        """
        Retrieves the documents for a given farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        return data.get('documents', [])

    def get_farmer_vectors(self, farmer_id: str):
        """
        Retrieves the vector data for a given farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        return data.get('vectors', {})

    def get_calendar_ai_analysis(self, farmer_id: str):
        """
        Analyzes a farmer's calendar events using AI and generates a summary and insights.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
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

    def create_farmer(self, farmer: Farmer):
        """
        Creates a new farmer entry in the database.
        """
        doc_ref = self.db.collection('farmers').document(farmer.farmerId)
        doc_ref.set(farmer.dict(exclude={'farmerId'}))
        return {"message": "Farmer created", "farmerId": farmer.farmerId}

    def add_livestock(self, farmer_id: str, livestock: Livestock):
        """
        Adds a new livestock entry to a farmer's record.
        """
        print(livestock)
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        livestock_list = data.get('livestock', [])
        livestock_list.append(livestock.dict())
        doc_ref.update({'livestock': livestock_list})
        return {"message": "Livestock added"}

    def add_crop(self, farmer_id: str, crop: Crop):
        """
        Adds a new crop entry to a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        crops = data.get('crops', [])
        crops.append(crop.dict())
        doc_ref.update({'crops': crops})
        return {"message": "Crop added"}

    def add_calendar_event(self, farmer_id: str, event: CalendarEvent):
        """
        Adds a new calendar event to a farmer's record.
        """
        print(f"Adding calendar event for farmer {farmer_id}: {event.dict()}")
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        events = data.get('calendarEvents', [])
        events.append(event.dict())
        doc_ref.update({'calendarEvents': events})
        return {"message": "Calendar event added"}

    def add_market_listing(self, farmer_id: str, listing: MarketListing):
        """
        Adds a new market listing to a farmer's record.
        """
        print(f"Adding market listing for farmer {farmer_id}: {listing.dict()}")
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        listings = data.get('marketListings', [])
        listings.append(listing.dict())
        doc_ref.update({'marketListings': listings})
        return {"message": "Market listing added"}

    def add_chat_history(self, farmer_id: str, chat: ChatHistory):
        """
        Adds a new chat history entry to a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        chats = data.get('chatHistory', [])
        chats.append(chat.dict())
        doc_ref.update({'chatHistory': chats})
        return {"message": "Chat history added"}

    def add_document(self, farmer_id: str, document: Document):
        """
        Adds a new document entry to a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        documents = data.get('documents', [])
        documents.append(document.dict())
        doc_ref.update({'documents': documents})
        return {"message": "Document added"}

    def set_vectors(self, farmer_id: str, vectors: Vectors):
        """
        Sets the vector data for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        doc_ref.update({'vectors': vectors.dict()})
        return {"message": "Vectors updated"}

    def add_space_suggestions(self, farmer_id: str, body: Dict[str, Any] = Body(...)):
        """
        Accepts an image (base64), animals, and calendar events.
        Stores the image, calls Gemini for analysis, and returns suggestions.
        """
        image_base64 = body.get('image')
        animals = body.get('animals', [])
        calendar = body.get('calendar', [])
        if not image_base64:
            raise HTTPException(status_code=400, detail="Image is required")
        doc_ref = self.db.collection('farmers').document(farmer_id)
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

    def update_livestock(self, farmer_id: str, item_id: str, livestock: Livestock):
        """
        Updates an existing livestock entry for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
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
        self.db.collection('farmers').document(farmer_id).update({'livestock': livestock_list})
        return {"message": "Livestock updated"}

    def update_crop(self, farmer_id: str, crop_id: str, crop: Crop):
        """
        Updates an existing crop entry for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
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
        self.db.collection('farmers').document(farmer_id).update({'crops': crops})
        return {"message": "Crop updated"}

    def update_calendar_event(self, farmer_id: str, event_id: str, event: CalendarEvent):
        """
        Updates an existing calendar event for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        events = data.get('calendarEvents', [])
        updated = False
        for i, item in enumerate(events):
            if item.get('task') == event_id: # Assuming 'task' is the unique identifier for calendar events
                events[i] = event.dict()
                updated = True
                break
        if not updated:
            raise HTTPException(status_code=404, detail="Calendar event not found")
        self.db.collection('farmers').document(farmer_id).update({'calendarEvents': events})
        return {"message": "Calendar event updated"}

    def update_market_listing(self, farmer_id: str, listing_id: str, listing: MarketListing):
        """
        Updates an existing market listing for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
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
        self.db.collection('farmers').document(farmer_id).update({'marketListings': listings})
        return {"message": "Market listing updated"}

    def update_chat_history(self, farmer_id: str, chat_id: str, chat: ChatHistory):
        """
        Updates an existing chat history entry for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
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
        self.db.collection('farmers').document(farmer_id).update({'chatHistory': chats})
        return {"message": "Chat history updated"}

    def update_document(self, farmer_id: str, doc_id: str, document: Document):
        """
        Updates an existing document entry for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
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
        self.db.collection('farmers').document(farmer_id).update({'documents': documents})
        return {"message": "Document updated"}

    def update_vectors(self, farmer_id: str, vectors: Vectors):
        """
        Updates the vector data for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        self.db.collection('farmers').document(farmer_id).update({'vectors': vectors.dict()})
        return {"message": "Vectors updated"}

    def delete_livestock(self, farmer_id: str, item_id: str):
        """
        Deletes a livestock entry from a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        livestock_list = data.get('livestock', [])
        new_list = [item for item in livestock_list if item.get('id') != item_id]
        if len(new_list) == len(livestock_list):
            raise HTTPException(status_code=404, detail="Livestock not found")
        self.db.collection('farmers').document(farmer_id).update({'livestock': new_list})
        return {"message": "Livestock deleted"}

    def delete_crop(self, farmer_id: str, crop_id: str):
        """
        Deletes a crop entry from a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        crops = data.get('crops', [])
        new_list = [item for item in crops if item.get('cropId') != crop_id]
        if len(new_list) == len(crops):
            raise HTTPException(status_code=404, detail="Crop not found")
        self.db.collection('farmers').document(farmer_id).update({'crops': new_list})
        return {"message": "Crop deleted"}

    def delete_calendar_event(self, farmer_id: str, event_id: str):
        """
        Deletes a calendar event from a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        events = data.get('calendarEvents', [])
        new_list = [item for item in events if item.get('task') != event_id] # Assuming 'task' is the unique identifier
        if len(new_list) == len(events):
            raise HTTPException(status_code=404, detail="Calendar event not found")
        self.db.collection('farmers').document(farmer_id).update({'calendarEvents': new_list})
        return {"message": "Calendar event deleted"}

    def delete_market_listing(self, farmer_id: str, listing_id: str):
        """
        Deletes a market listing from a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        listings = data.get('marketListings', [])
        new_list = [item for item in listings if item.get('id') != listing_id]
        if len(new_list) == len(listings):
            raise HTTPException(status_code=404, detail="Market listing not found")
        self.db.collection('farmers').document(farmer_id).update({'marketListings': new_list})
        return {"message": "Market listing deleted"}

    def delete_chat_history(self, farmer_id: str, chat_id: str):
        """
        Deletes a chat history entry from a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        chats = data.get('chatHistory', [])
        new_list = [item for item in chats if item.get('id') != chat_id]
        if len(new_list) == len(chats):
            raise HTTPException(status_code=404, detail="Chat history not found")
        self.db.collection('farmers').document(farmer_id).update({'chatHistory': new_list})
        return {"message": "Chat history deleted"}

    def delete_document(self, farmer_id: str, doc_id: str):
        """
        Deletes a document entry from a farmer's record.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        data = doc.to_dict()
        documents = data.get('documents', [])
        new_list = [item for item in documents if item.get('id') != doc_id]
        if len(new_list) == len(documents):
            raise HTTPException(status_code=404, detail="Document not found")
        self.db.collection('farmers').document(farmer_id).update({'documents': new_list})
        return {"message": "Document deleted"}

    def delete_vectors(self, farmer_id: str):
        """
        Deletes the vector data for a farmer.
        """
        doc_ref = self.db.collection('farmers').document(farmer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        self.db.collection('farmers').document(farmer_id).update({'vectors': firestore.DELETE_FIELD})
        return {"message": "Vectors deleted"}
