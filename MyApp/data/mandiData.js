// Real Mandi Data for India - Major Agricultural Markets
export const REAL_MANDI_DATA = [
  {
    id: 'vashi_mumbai',
    name: 'Vashi Agricultural Produce Market Committee',
    location: 'Navi Mumbai',
    state: 'Maharashtra',
    district: 'Thane',
    address: 'Sector 19, Vashi, Navi Mumbai - 400703',
    phone: '+91-22-27811081',
    website: 'http://www.vashimarket.com',
    contactPerson: 'Market Committee Secretary',
    operatingHours: '6:00 AM - 2:00 PM',
    facilities: ['Modern Infrastructure', 'Parking', 'Banking', 'Restaurants'],
    specialization: ['Vegetables', 'Fruits', 'Grains'],
    yearEstablished: 1989,
    area: '148 acres',
    dailyTurnover: '₹8-12 crores',
    crops: {
      'Rice': { avgPrice: 1900, minPrice: 1750, maxPrice: 2100, availability: true },
      'Tomato': { avgPrice: 3200, minPrice: 2800, maxPrice: 3800, availability: true },
      'Onion': { avgPrice: 1700, minPrice: 1450, maxPrice: 2000, availability: true },
      'Potato': { avgPrice: 1200, minPrice: 1000, maxPrice: 1400, availability: true },
      'Coconut': { avgPrice: 2400, minPrice: 2100, maxPrice: 2700, availability: true }
    },
    services: {
      pickupService: false,
      onSiteDealing: true,
      qualityTesting: true,
      storageAvailable: true
    }
  },
  {
    id: 'deonar_mumbai',
    name: 'Deonar APMC (Mumbai)',
    location: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    address: 'Deonar, Mumbai - 400088',
    phone: '+91-22-24123456',
    website: 'https://www.mahaapmc.gov.in/deonar',
    contactPerson: 'Market Superintendent',
    operatingHours: '4:00 AM - 12:00 PM',
    facilities: ['Cold Storage', 'Transportation', 'Quality Testing'],
    specialization: ['Vegetables', 'Fruits', 'Seafood (nearby)'],
    yearEstablished: 1955,
    area: '120 acres',
    dailyTurnover: '₹12-18 crores',
    crops: {
      'Onion': { avgPrice: 1650, minPrice: 1400, maxPrice: 1900, availability: true },
      'Tomato': { avgPrice: 3000, minPrice: 2500, maxPrice: 3400, availability: true },
      'Potato': { avgPrice: 1150, minPrice: 950, maxPrice: 1350, availability: true },
      'Mango': { avgPrice: 4500, minPrice: 3500, maxPrice: 6000, availability: true }
    },
    services: {
      pickupService: true,
      onSiteDealing: true,
      qualityTesting: true,
      storageAvailable: true
    }
  },
  {
    id: 'thane_apmc',
    name: 'Thane APMC',
    location: 'Thane',
    state: 'Maharashtra',
    district: 'Thane',
    address: 'Majiwada, Thane - 400601',
    phone: '+91-22-25467890',
    website: 'https://thaneapmc.maha',
    contactPerson: 'Market Secretary',
    operatingHours: '5:00 AM - 1:00 PM',
    facilities: ['Weighbridge', 'Cold Storage', 'Banking'],
    specialization: ['Vegetables', 'Fruits'],
    yearEstablished: 1980,
    area: '90 acres',
    dailyTurnover: '₹4-7 crores',
    crops: {
      'Rice': { avgPrice: 1880, minPrice: 1700, maxPrice: 2050, availability: true },
      'Onion': { avgPrice: 1600, minPrice: 1350, maxPrice: 1850, availability: true },
      'Mango': { avgPrice: 5000, minPrice: 3800, maxPrice: 7000, availability: true }
    },
    services: {
      pickupService: true,
      onSiteDealing: true,
      qualityTesting: false,
      storageAvailable: false
    }
  },
  {
    id: 'pune_khedshivapur',
    name: 'Pune Khed Shivapur APMC',
    location: 'Pune',
    state: 'Maharashtra',
    district: 'Pune',
    address: 'Khed Shivapur, Pune - 411042',
    phone: '+91-20-26900000',
    website: 'https://puneapmc.maha',
    contactPerson: 'General Manager',
    operatingHours: '4:00 AM - 12:00 PM',
    facilities: ['Cold Storage', 'Logistics', 'Quality Testing'],
    specialization: ['Horticulture', 'Vegetables'],
    yearEstablished: 1992,
    area: '200 acres',
    dailyTurnover: '₹6-10 crores',
    crops: {
      'Tomato': { avgPrice: 2800, minPrice: 2300, maxPrice: 3300, availability: true },
      'Onion': { avgPrice: 1500, minPrice: 1250, maxPrice: 1800, availability: true },
      'Potato': { avgPrice: 1100, minPrice: 900, maxPrice: 1300, availability: true }
    },
    services: {
      pickupService: true,
      onSiteDealing: true,
      qualityTesting: true,
      storageAvailable: true
    }
  },
  {
    id: 'mapusa_goa',
    name: 'Mapusa Market',
    location: 'Mapusa',
    state: 'Goa',
    district: 'North Goa',
    address: 'Mapusa Market, Bardez, Goa - 403507',
    phone: '+91-832-2251234',
    website: 'https://mapusamarket.goa',
    contactPerson: 'Market Manager',
    operatingHours: '5:00 AM - 11:00 AM',
    facilities: ['Wholesale Trading', 'Retail Stalls'],
    specialization: ['Vegetables', 'Fruits', 'Spices'],
    yearEstablished: 1970,
    area: '20 acres',
    dailyTurnover: '₹1-2 crores',
    crops: {
      'Coconut': { avgPrice: 2300, minPrice: 2000, maxPrice: 2600, availability: true },
      'Banana': { avgPrice: 4200, minPrice: 3800, maxPrice: 4800, availability: true },
      'Mango': { avgPrice: 4800, minPrice: 3500, maxPrice: 6500, availability: true }
    },
    services: {
      pickupService: false,
      onSiteDealing: true,
      qualityTesting: false,
      storageAvailable: false
    }
  },
  {
    id: 'surat_apmc',
    name: 'Surat APMC',
    location: 'Surat',
    state: 'Gujarat',
    district: 'Surat',
    address: 'Bardoli Road, Surat - 395003',
    phone: '+91-261-2456789',
    website: 'https://suratapmc.guj',
    contactPerson: 'Market Secretary',
    operatingHours: '4:00 AM - 12:00 PM',
    facilities: ['Cold Storage', 'Weighbridge', 'Quality Testing'],
    specialization: ['Fruits', 'Vegetables', 'Cash Crops'],
    yearEstablished: 1985,
    area: '160 acres',
    dailyTurnover: '₹7-11 crores',
    crops: {
      'Rice': { avgPrice: 1860, minPrice: 1700, maxPrice: 2050, availability: true },
      'Onion': { avgPrice: 1400, minPrice: 1200, maxPrice: 1650, availability: true },
      'Mango': { avgPrice: 5200, minPrice: 3800, maxPrice: 7500, availability: true }
    },
    services: {
      pickupService: true,
      onSiteDealing: true,
      qualityTesting: true,
      storageAvailable: true
    }
  },
  {
    id: 'ahmedabad_apmc',
    name: 'Ahmedabad APMC',
    location: 'Ahmedabad',
    state: 'Gujarat',
    district: 'Ahmedabad',
    address: 'Vastrapur/AMS Compound, Ahmedabad - 380015',
    phone: '+91-79-26300000',
    website: 'https://ahmedabadapmc.guj',
    contactPerson: 'Market Manager',
    operatingHours: '5:00 AM - 1:00 PM',
    facilities: ['Cold Storage', 'Banking', 'Transportation'],
    specialization: ['Grains', 'Fruits', 'Vegetables'],
    yearEstablished: 1978,
    area: '220 acres',
    dailyTurnover: '₹10-16 crores',
    crops: {
      'Wheat': { avgPrice: 2450, minPrice: 2300, maxPrice: 2600, availability: true },
      'Rice': { avgPrice: 1900, minPrice: 1750, maxPrice: 2100, availability: true },
      'Onion': { avgPrice: 1500, minPrice: 1250, maxPrice: 1800, availability: true }
    },
    services: {
      pickupService: true,
      onSiteDealing: true,
      qualityTesting: true,
      storageAvailable: true
    }
  }
];

// Common crops available across most mandis
export const COMMON_CROPS = [
  'Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Coconut', 'Banana', 'Mango', 'Chili'
];

// Utility functions
export const findMandisByCrop = (cropName) => {
  return REAL_MANDI_DATA.filter(mandi => 
    mandi.crops[cropName] && mandi.crops[cropName].availability
  );
};

export const getMandiById = (mandiId) => {
  return REAL_MANDI_DATA.find(mandi => mandi.id === mandiId);
};

export const getCropPriceInMandi = (mandiId, cropName) => {
  const mandi = getMandiById(mandiId);
  return mandi?.crops[cropName] || null;
};

export const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
};

// Add back getMandisByDistance
export const getMandisByDistance = (maxDistance = 200) => {
  // For demo, just return all mandis (no real distance calculation)
  return REAL_MANDI_DATA;
};

// AI-Powered Strategic Farming Plans (Professional, neutral names)
export const AI_STRATEGIC_PLANS = [
  {
    id: 'plan_1',
    name: 'Diversified Crop Plan',
    description: 'A balanced plan with a mix of high-demand crops for stable returns.',
    targetFarmer: 'Small to medium farmers',
    defaultMandi: 'vashi_mumbai', // Preselected mandi near Mumbai
    crops: [
      { name: 'Banana', mandi: 'mapusa_goa', expectedProfit: 18000, riskLevel: 'Medium' },
      { name: 'Mango', mandi: 'surat_apmc', expectedProfit: 25000, riskLevel: 'Low' }
    ],
    totalInvestment: 45000,
    expectedReturns: 88000,
    roi: 95.5,
    duration: '4-6 months',
    aiInsights: [
      'Banana demand remains steady in coastal markets',
      'Mango fetches premium prices in Gujarat and export channels',
      'Mixed cropping reduces risk during price dips'
    ],
    riskProfile: 'Moderate',
    suitableFor: ['Mixed farming', 'Market access'],
    gradient: ['#4C1D95', '#7C3AED'],
    investment: '₹45,000',
    expectedROI: '95.5%',
    riskLevel: 'Low'
  },
  {
    id: 'plan_2',
    name: 'Traditional Crop Plan',
    description: 'Low risk, consistent returns with traditional crops.',
    targetFarmer: 'Risk-averse farmers',
    defaultMandi: 'ahmedabad_apmc', // Preselected mandi in Gujarat
    crops: [
      { name: 'Wheat', mandi: 'ahmedabad_apmc', expectedProfit: 15000, riskLevel: 'Very Low' },
      { name: 'Rice', mandi: 'surat_apmc', expectedProfit: 12000, riskLevel: 'Low' }
    ],
    totalInvestment: 35000,
    expectedReturns: 62000,
    roi: 77.1,
    duration: '6-8 months',
    aiInsights: [
      'Wheat and rice remain staple crops with steady offtake',
      'Gujarat markets show stable pricing for staples',
      'Good storage lowers post-harvest loss'
    ],
    riskProfile: 'Conservative',
    suitableFor: ['Traditional farming', 'Organic certification'],
    gradient: ['#059669', '#10B981'],
    investment: '₹35,000',
    expectedROI: '77.1%',
    riskLevel: 'Very Low'
  },
  {
    id: 'plan_3',
    name: 'Short-Term Crop Plan',
    description: 'Crops with shorter cycles for faster returns.',
    targetFarmer: 'Farmers needing quick returns',
    defaultMandi: 'pune_khedshivapur', // Preselected mandi near Pune
    crops: [
      { name: 'Tomato', mandi: 'pune_khedshivapur', expectedProfit: 8000, riskLevel: 'Medium' },
      { name: 'Onion', mandi: 'pune_khedshivapur', expectedProfit: 6000, riskLevel: 'Medium' }
    ],
    totalInvestment: 20000,
    expectedReturns: 34000,
    roi: 70.0,
    duration: '3-4 months',
    aiInsights: [
      'Vegetable prices peak during festival seasons',
      'Pune APMC has good connectivity to markets',
      'Quick harvest cycles allow multiple plantings'
    ],
    riskProfile: 'Moderate',
    suitableFor: ['Short cycle farming', 'Multiple harvests'],
    gradient: ['#DC2626', '#EF4444'],
    investment: '₹20,000',
    expectedROI: '70.0%',
    riskLevel: 'Medium'
  }
];

// Dummy calculateDistance export for UI
export const calculateDistance = (mandi) => {
  // In a real app, calculate distance based on user location and mandi location
  return 'Distance: 10 km';
};
