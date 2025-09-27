from typing import Type, Dict, Any
from pydantic import BaseModel, Field
from services.farmer import FarmerService
from models.farmer import Farmer, FarmerProfile, Livestock, Crop, CalendarEvent, MarketListing, ChatHistory, Document, Vectors

class FarmerTool:
    def __init__(self, farmer_service: FarmerService):
        self.farmer_service = farmer_service

    def get_tools(self) -> Dict[str, Any]:
        return {
            "get_farmer": {
                "description": "Retrieves a farmer's complete data by their ID.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_farmer_profile": {
                "description": "Retrieves a farmer's profile information by their ID.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "update_farmer_profile": {
                "description": "Updates a farmer's profile information.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "profile": {"type": "object", "description": "A dictionary containing the profile fields to update."}
                    },
                    "required": ["farmer_id", "profile"]
                }
            },
            "get_farmer_livestock": {
                "description": "Retrieves the list of livestock for a given farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_farmer_crops": {
                "description": "Retrieves the list of crops for a given farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_farmer_calendar": {
                "description": "Retrieves the calendar events for a given farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_farmer_market": {
                "description": "Retrieves the market listings for a given farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_farmer_chat_history": {
                "description": "Retrieves the chat history for a given farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_farmer_documents": {
                "description": "Retrieves the documents for a given farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_farmer_vectors": {
                "description": "Retrieves the vector data for a given farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "get_calendar_ai_analysis": {
                "description": "Analyzes a farmer's calendar events using AI and generates a summary and insights.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            },
            "create_farmer": {
                "description": "Creates a new farmer entry in the database.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer": Farmer.schema() # Using Pydantic schema for validation
                    },
                    "required": ["farmer"]
                }
            },
            "add_livestock": {
                "description": "Adds a new livestock entry to a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "livestock": Livestock.schema()
                    },
                    "required": ["farmer_id", "livestock"]
                }
            },
            "add_crop": {
                "description": "Adds a new crop entry to a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "crop": Crop.schema()
                    },
                    "required": ["farmer_id", "crop"]
                }
            },
            "add_calendar_event": {
                "description": "Adds a new calendar event to a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "event": CalendarEvent.schema()
                    },
                    "required": ["farmer_id", "event"]
                }
            },
            "add_market_listing": {
                "description": "Adds a new market listing to a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "listing": MarketListing.schema()
                    },
                    "required": ["farmer_id", "listing"]
                }
            },
            "add_chat_history": {
                "description": "Adds a new chat history entry to a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "chat": ChatHistory.schema()
                    },
                    "required": ["farmer_id", "chat"]
                }
            },
            "add_document": {
                "description": "Adds a new document entry to a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "document": Document.schema()
                    },
                    "required": ["farmer_id", "document"]
                }
            },
            "set_vectors": {
                "description": "Sets the vector data for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "vectors": Vectors.schema()
                    },
                    "required": ["farmer_id", "vectors"]
                }
            },
            "add_space_suggestions": {
                "description": "Accepts an image (base64), animals, and calendar events. Stores the image, calls Gemini for analysis, and returns suggestions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "body": {
                            "type": "object",
                            "properties": {
                                "image": {"type": "string", "description": "Base64 encoded image."},
                                "animals": {"type": "array", "items": {"type": "string"}, "description": "List of animals."},
                                "calendar": {"type": "array", "items": {"type": "string"}, "description": "List of calendar events."}
                            },
                            "required": ["image"]
                        }
                    },
                    "required": ["farmer_id", "body"]
                }
            },
            "update_livestock": {
                "description": "Updates an existing livestock entry for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "item_id": {"type": "string", "description": "The ID of the livestock item to update."},
                        "livestock": Livestock.schema()
                    },
                    "required": ["farmer_id", "item_id", "livestock"]
                }
            },
            "update_crop": {
                "description": "Updates an existing crop entry for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "crop_id": {"type": "string", "description": "The ID of the crop to update."},
                        "crop": Crop.schema()
                    },
                    "required": ["farmer_id", "crop_id", "crop"]
                }
            },
            "update_calendar_event": {
                "description": "Updates an existing calendar event for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "event_id": {"type": "string", "description": "The ID (task name) of the calendar event to update."},
                        "event": CalendarEvent.schema()
                    },
                    "required": ["farmer_id", "event_id", "event"]
                }
            },
            "update_market_listing": {
                "description": "Updates an existing market listing for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "listing_id": {"type": "string", "description": "The ID of the market listing to update."},
                        "listing": MarketListing.schema()
                    },
                    "required": ["farmer_id", "listing_id", "listing"]
                }
            },
            "update_chat_history": {
                "description": "Updates an existing chat history entry for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "chat_id": {"type": "string", "description": "The ID of the chat history entry to update."},
                        "chat": ChatHistory.schema()
                    },
                    "required": ["farmer_id", "chat_id", "chat"]
                }
            },
            "update_document": {
                "description": "Updates an existing document entry for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "doc_id": {"type": "string", "description": "The ID of the document to update."},
                        "document": Document.schema()
                    },
                    "required": ["farmer_id", "doc_id", "document"]
                }
            },
            "update_vectors": {
                "description": "Updates the vector data for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "vectors": Vectors.schema()
                    },
                    "required": ["farmer_id", "vectors"]
                }
            },
            "delete_livestock": {
                "description": "Deletes a livestock entry from a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "item_id": {"type": "string", "description": "The ID of the livestock item to delete."}
                    },
                    "required": ["farmer_id", "item_id"]
                }
            },
            "delete_crop": {
                "description": "Deletes a crop entry from a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "crop_id": {"type": "string", "description": "The ID of the crop to delete."}
                    },
                    "required": ["farmer_id", "crop_id"]
                }
            },
            "delete_calendar_event": {
                "description": "Deletes a calendar event from a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "event_id": {"type": "string", "description": "The ID (task name) of the calendar event to delete."}
                    },
                    "required": ["farmer_id", "event_id"]
                }
            },
            "delete_market_listing": {
                "description": "Deletes a market listing from a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "listing_id": {"type": "string", "description": "The ID of the market listing to delete."}
                    },
                    "required": ["farmer_id", "listing_id"]
                }
            },
            "delete_chat_history": {
                "description": "Deletes a chat history entry from a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "chat_id": {"type": "string", "description": "The ID of the chat history entry to delete."}
                    },
                    "required": ["farmer_id", "chat_id"]
                }
            },
            "delete_document": {
                "description": "Deletes a document entry from a farmer's record.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."},
                        "doc_id": {"type": "string", "description": "The ID of the document to delete."}
                    },
                    "required": ["farmer_id", "doc_id"]
                }
            },
            "delete_vectors": {
                "description": "Deletes the vector data for a farmer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {"type": "string", "description": "The ID of the farmer."}
                    },
                    "required": ["farmer_id"]
                }
            }
        }

    def call_tool(self, tool_name: str, **kwargs):
        """
        Calls the specified tool method on the FarmerService instance.
        """
        if hasattr(self.farmer_service, tool_name):
            method = getattr(self.farmer_service, tool_name)
            return method(**kwargs)
        else:
            raise ValueError(f"Tool '{tool_name}' not found in FarmerService.")
