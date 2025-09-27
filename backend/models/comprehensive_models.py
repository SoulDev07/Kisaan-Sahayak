from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Crop Marketplace Models
class CropMarketplaceListing(BaseModel):
    farmer_id: str
    crop_name: str
    variety: str
    quantity: float
    unit: str = Field(description="kg, quintal, ton, etc.")
    price_per_unit: float
    total_price: float
    quality_grade: str = Field(description="A, B, C grade")
    organic_certified: bool = False
    harvest_date: str
    location: Dict[str, str] = Field(description="district, state, pin_code")
    images: List[str] = []
    description: str
    contact_info: Dict[str, str]
    available_from: str
    available_until: str
    negotiable: bool = True
    category: str = Field(description="Cereals, Pulses, Vegetables, etc.")

class CropOrder(BaseModel):
    buyer_farmer_id: str
    seller_farmer_id: str
    crop_listing_id: str
    quantity_ordered: float
    agreed_price_per_unit: float
    total_amount: float
    delivery_address: Dict[str, str]
    special_instructions: Optional[str] = None
    payment_method: str = "cash_on_delivery"
    expected_delivery_date: str

class CropNegotiation(BaseModel):
    order_id: str
    buyer_id: str
    seller_id: str
    original_price: float
    proposed_price: float
    message: str
    status: str = "pending"  # pending, accepted, rejected

# Enhanced Rental Models
class RentalEquipment(BaseModel):
    name: str
    description: str
    category: str = Field(description="Tractors, Harvesters, Tools, etc.")
    type: str
    owner: Dict[str, str] = Field(description="farmer details")
    location: Dict[str, str] = Field(description="village, district, state")
    price_per_day: float
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    images: List[str] = []
    availability_start: str
    availability_end: str
    min_rental_days: int = 1
    max_rental_days: int = 30
    condition: str = "good"  # excellent, good, fair, poor
    year_manufactured: Optional[int] = None
    specifications: Dict[str, Any] = {}
    insurance_covered: bool = False
    delivery_available: bool = False
    operator_included: bool = False

class RentalBooking(BaseModel):
    equipment_id: str
    renter_farmer_id: str
    owner_farmer_id: str
    start_date: str
    end_date: str
    total_days: int
    price_per_day: float
    total_amount: float
    deposit_amount: float
    notes: Optional[str] = None
    delivery_required: bool = False
    delivery_address: Optional[Dict[str, str]] = None
    contact_info: Dict[str, str]

class RentalReview(BaseModel):
    equipment_id: str
    booking_id: str
    reviewer_farmer_id: str
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5")
    comment: str
    review_type: str = "equipment"  # equipment, owner, experience
    photos: List[str] = []
    would_recommend: bool = True

class RentalPayment(BaseModel):
    booking_id: str
    amount: float
    payment_type: str = Field(description="deposit, rental_fee, penalty, refund")
    payment_method: str = "cash"
    transaction_id: Optional[str] = None
    payment_date: str
    status: str = "completed"  # pending, completed, failed, refunded

# Crop Cycle Models
class CropMaster(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    category: str = Field(description="Cereals, Pulses, Oilseeds, etc.")
    description: str
    growing_season: str = Field(description="Kharif, Rabi, Zaid")
    climate_requirements: Dict[str, Any]
    soil_requirements: Dict[str, Any]
    water_requirements: Dict[str, Any]
    growth_duration_days: int
    stages: List[Dict[str, Any]]
    common_varieties: List[str]
    market_price_range: Dict[str, float]
    nutritional_value: Dict[str, Any]
    best_practices: List[str]
    common_diseases: List[str]
    fertilizer_schedule: List[Dict[str, Any]]
    irrigation_schedule: List[Dict[str, Any]]
    companion_crops: List[str] = []
    harvest_indicators: List[str] = []

class CropCycle(BaseModel):
    farmer_id: str
    crop_id: str
    crop_name: str
    variety: str
    area_planted: float = Field(description="Area in acres")
    planting_date: str
    expected_harvest_date: str
    actual_harvest_date: Optional[str] = None
    current_stage: str = "preparation"
    progress_percentage: float = 0.0
    location: Dict[str, str] = Field(description="field location details")
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    seed_source: Optional[str] = None
    seed_cost: Optional[float] = None
    expected_yield: Optional[float] = None
    actual_yield: Optional[float] = None
    quality_grade: Optional[str] = None
    total_cost: Optional[float] = None
    total_revenue: Optional[float] = None
    profit_loss: Optional[float] = None
    notes: Optional[str] = None
    weather_challenges: List[str] = []
    pest_disease_issues: List[str] = []

class CropTask(BaseModel):
    cycle_id: str
    farmer_id: str
    task_name: str
    task_type: str = Field(description="irrigation, fertilization, pest_control, etc.")
    description: str
    scheduled_date: str
    actual_completion_date: Optional[str] = None
    priority: str = Field(description="low, medium, high, urgent")
    status: str = "pending"  # pending, in_progress, completed, skipped, overdue
    estimated_duration_hours: float
    actual_duration_hours: Optional[float] = None
    required_resources: List[str] = []
    cost_estimate: Optional[float] = None
    actual_cost: Optional[float] = None
    assigned_to: Optional[str] = None  # Worker/laborer name
    completion_notes: Optional[str] = None
    reminder_sent: bool = False
    photos_before: List[str] = []
    photos_after: List[str] = []

class CropStageProgress(BaseModel):
    cycle_id: str
    stage_name: str
    stage_number: int
    start_date: str
    expected_end_date: str
    actual_end_date: Optional[str] = None
    progress_percentage: float = 0.0
    key_activities: List[str] = []
    completed_activities: List[str] = []
    challenges_faced: List[str] = []
    notes: Optional[str] = None
    photos: List[str] = []
    weather_data: Optional[Dict[str, Any]] = None

class CropAnalytics(BaseModel):
    farmer_id: str
    analysis_period: str = Field(description="monthly, yearly, seasonal")
    total_cycles: int
    active_cycles: int
    completed_cycles: int
    total_area_cultivated: float
    total_investment: float
    total_revenue: float
    net_profit: float
    average_yield_per_acre: float
    success_rate: float = Field(description="Percentage of successful cycles")
    most_profitable_crop: str
    crop_diversity_index: float
    seasonal_distribution: Dict[str, int]
    resource_utilization: Dict[str, Any]
    recommendations: List[str] = []

# Notification Models
class NotificationPreference(BaseModel):
    farmer_id: str
    email_notifications: bool = True
    sms_notifications: bool = True
    push_notifications: bool = True
    whatsapp_notifications: bool = False
    notification_types: List[str] = [
        "task_reminders", "weather_alerts", "market_prices", 
        "order_updates", "booking_confirmations", "payment_notifications"
    ]
    quiet_hours_start: str = "22:00"
    quiet_hours_end: str = "06:00"

class FarmerNotification(BaseModel):
    farmer_id: str
    title: str
    message: str
    type: str = Field(description="info, warning, alert, success")
    category: str = Field(description="task, weather, market, order, booking, etc.")
    priority: str = "medium"  # low, medium, high, urgent
    read: bool = False
    action_required: bool = False
    action_url: Optional[str] = None
    related_id: Optional[str] = None  # Related cycle_id, order_id, etc.
    expires_at: Optional[str] = None
    created_at: str
    read_at: Optional[str] = None

# Analytics and Reporting Models
class MarketTrend(BaseModel):
    crop_name: str
    region: str
    price_trend: str = Field(description="increasing, decreasing, stable")
    current_price: float
    price_change_percentage: float
    demand_level: str = Field(description="high, medium, low")
    supply_level: str = Field(description="high, medium, low")
    seasonal_pattern: Dict[str, float]
    forecast_next_month: Dict[str, Any]
    factors_affecting_price: List[str] = []
    recommendation: str

class WeatherImpactAnalysis(BaseModel):
    farmer_id: str
    crop_cycle_id: str
    weather_events: List[Dict[str, Any]]
    impact_assessment: Dict[str, Any]
    yield_impact_percentage: float
    quality_impact: str = Field(description="improved, unchanged, degraded")
    recommended_actions: List[str] = []
    insurance_claim_eligible: bool = False
    adaptation_strategies: List[str] = []
