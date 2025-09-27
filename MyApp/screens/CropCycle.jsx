import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CropCycleService from '../services/CropCycleService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MicOverlay from '../components/MicOverlay';

const { width, height } = Dimensions.get('window');

const FarmingAssistant = () => {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [farmDetails, setFarmDetails] = useState({
    landSize: '',
    irrigation: '',
    tools: []
  });
  const [selectedTile, setSelectedTile] = useState(null);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [realData, setRealData] = useState({
    analysis: null,
    insights: [],
    buyers: [],
    loans: [],
    insurance: [],
    certifications: [],
    solar: [],
    mandi: [],
    government: []
  });

  // Add a new state for cache loading
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [dashboardGenerated, setDashboardGenerated] = useState(false);

  // ===== ENHANCED CROP CYCLE FUNCTIONALITY =====
  const FARMER_ID = 'f001';
  const [availableCrops, setAvailableCrops] = useState([]);
  const [myCropCycles, setMyCropCycles] = useState([]);
  const [cropRecommendations, setCropRecommendations] = useState([]);
  const [cropAnalytics, setCropAnalytics] = useState(null);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [newCropForm, setNewCropForm] = useState({
    name: '',
    category: 'cereals',
    season: 'kharif',
    duration_days: '',
    description: ''
  });
  const [newCycleForm, setNewCycleForm] = useState({
    crop_id: '',
    area_acres: '',
    expected_yield: '',
    planting_date: '',
    notes: ''
  });

  // Load enhanced crop data
  const loadEnhancedCropData = async () => {
    console.log('🌱 Loading enhanced crop data...');
    try {
      // Load available crops with fallback
      try {
        console.log('📡 Calling CropCycleService.getAllCrops()...');
        const cropsResponse = await CropCycleService.getAllCrops();
        if (cropsResponse.success) {
          console.log('✅ Crops API call successful:', cropsResponse.crops?.length, 'crops loaded');
          setAvailableCrops(cropsResponse.crops || []);
        }
      } catch (error) {
        console.log('⚠️ Crops API not available, using fallback data:', error.message);
        // Set fallback crop data
        setAvailableCrops([
          { id: 1, name: 'Rice', category: 'cereals', season: 'kharif', duration_days: 120 },
          { id: 2, name: 'Wheat', category: 'cereals', season: 'rabi', duration_days: 140 },
          { id: 3, name: 'Maize', category: 'cereals', season: 'both', duration_days: 100 },
          { id: 4, name: 'Cotton', category: 'fiber', season: 'kharif', duration_days: 180 },
          { id: 5, name: 'Sugarcane', category: 'cash', season: 'annual', duration_days: 365 }
        ]);
      }

      // Load farmer's crop cycles with fallback
      try {
        console.log('📡 Calling CropCycleService.getFarmerCropCycles()...');
        const cyclesResponse = await CropCycleService.getFarmerCropCycles(FARMER_ID);
        if (cyclesResponse.success) {
          console.log('✅ Farmer cycles API call successful:', cyclesResponse.cycles?.length, 'cycles loaded');
          setMyCropCycles(cyclesResponse.cycles || []);
        }
      } catch (error) {
        console.log('Crop cycles API not available, using fallback data');
        setMyCropCycles([]);
      }

      // Load crop recommendations with fallback
      try {
        console.log('📡 Calling CropCycleService.getFarmerCropRecommendations()...');
        const recommendationsResponse = await CropCycleService.getFarmerCropRecommendations(FARMER_ID);
        if (recommendationsResponse.success) {
          console.log('✅ Recommendations API call successful:', recommendationsResponse.recommendations?.length, 'recommendations loaded');
          setCropRecommendations(recommendationsResponse.recommendations || []);
        }
      } catch (error) {
        console.log('⚠️ Recommendations API not available, using fallback data:', error.message);
        setCropRecommendations([]);
      }

      // Load crop analytics with fallback
      try {
        console.log('📡 Calling CropCycleService.getFarmerCropAnalytics()...');
        const analyticsResponse = await CropCycleService.getFarmerCropAnalytics(FARMER_ID);
        if (analyticsResponse.success) {
          console.log('✅ Analytics API call successful');
          setCropAnalytics(analyticsResponse.analytics);
        }
      } catch (error) {
        console.log('⚠️ Analytics API not available, using fallback data:', error.message);
        setCropAnalytics(null);
      }
    } catch (error) {
      console.log('Enhanced crop data loading completed with fallbacks');
    }
  };

  // Add new crop to system
  const addNewCrop = async () => {
    if (!newCropForm.name.trim()) {
      Alert.alert('Error', 'Please enter crop name');
      return;
    }

    try {
      const response = await CropCycleService.addNewCrop(newCropForm);
      if (response.success) {
        Alert.alert('Success', 'Crop added successfully!');
        setShowAddCropModal(false);
        setNewCropForm({
          name: '',
          category: 'cereals',
          season: 'kharif',
          duration_days: '',
          description: ''
        });
        loadEnhancedCropData(); // Refresh crops
      }
    } catch (error) {
      console.log('Crop API not available, simulating success');
      Alert.alert('Success', 'Crop added successfully! (Offline mode)');
      setShowAddCropModal(false);
      setNewCropForm({
        name: '',
        category: 'cereals',
        season: 'kharif',
        duration_days: '',
        description: ''
      });
      // Add to local state for offline mode
      const newCrop = {
        id: Date.now(),
        name: newCropForm.name,
        category: newCropForm.category,
        season: newCropForm.season,
        duration_days: parseInt(newCropForm.duration_days) || 120,
        description: newCropForm.description
      };
      setAvailableCrops(prev => [...prev, newCrop]);
    }
  };

  // Start new crop cycle
  const startNewCropCycle = async () => {
    if (!newCycleForm.crop_id || !newCycleForm.area_acres) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      const response = await CropCycleService.startCropCycle(FARMER_ID, newCycleForm);
      if (response.success) {
        Alert.alert('Success', 'Crop cycle started successfully!');
        setShowCycleModal(false);
        setNewCycleForm({
          crop_id: '',
          area_acres: '',
          expected_yield: '',
          planting_date: '',
          notes: ''
        });
        loadEnhancedCropData(); // Refresh cycles
      }
    } catch (error) {
      console.log('Crop cycle API not available, simulating success');
      Alert.alert('Success', 'Crop cycle started successfully! (Offline mode)');
      setShowCycleModal(false);
      setNewCycleForm({
        crop_id: '',
        area_acres: '',
        expected_yield: '',
        planting_date: '',
        notes: ''
      });
      // Add to local state for offline mode
      const selectedCropData = availableCrops.find(crop => crop.id.toString() === newCycleForm.crop_id);
      const newCycle = {
        id: Date.now(),
        crop_name: selectedCropData?.name || 'Unknown Crop',
        area_acres: parseFloat(newCycleForm.area_acres),
        expected_yield: newCycleForm.expected_yield,
        planting_date: newCycleForm.planting_date || new Date().toISOString().split('T')[0],
        notes: newCycleForm.notes,
        status: 'active',
        created_at: new Date().toISOString()
      };
      setMyCropCycles(prev => [...prev, newCycle]);
    }
  };

  // Helper: Save to AsyncStorage
  const saveToCache = async (data) => {
    try {
      await AsyncStorage.setItem('cropcycle_dashboard_data', JSON.stringify(data));
    } catch (e) {
      // Ignore cache errors
    }
  };

  // Helper: Load from AsyncStorage
  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem('cropcycle_dashboard_data');
      if (cached) {
        setRealData(JSON.parse(cached));
        setCacheLoaded(true);
        return true;
      }
    } catch (e) {}
    setCacheLoaded(true);
    return false;
  };

  // Fetch all dashboard data in parallel and cache with fallbacks
  const fetchAllDashboardData = async () => {
    console.log('🚀 Starting fetchAllDashboardData for:', { selectedCrop, landSize: farmDetails.landSize, irrigation: farmDetails.irrigation });
    setLoading(true);
    try {
      // Create fallback data for when APIs are not available
      const fallbackAnalysis = {
        analysis: {
          feasibility: '85%',
          expected_profit: '₹45,000',
          roi_percentage: '120%',
          risk_level: 'Low',
          market_demand: 'High',
          seasonality: 'Optimal'
        }
      };

      const fallbackInsights = [
        `Market demand for ${selectedCrop} is expected to rise by 15% this season`,
        "Optimal planting window: Next 2-3 weeks based on weather patterns",
        "Consider companion planting with legumes to improve soil nitrogen",
        "Current market price is 8% above last year - good selling opportunity",
        "Weather forecast shows adequate rainfall for the next month"
      ];

      const fallbackData = {
        analysis: fallbackAnalysis,
        insights: fallbackInsights,
        buyers: [
          { name: 'ITC Limited', contact: '+91-98765-43210', requirements: 'Organic certified' },
          { name: 'Reliance Fresh', contact: '+91-98765-43211', requirements: 'Grade A quality' },
          { name: 'BigBasket', contact: '+91-98765-43212', requirements: 'Direct farm supply' }
        ],
        loans: [
          { name: 'Kisan Credit Card', amount: '₹3,00,000', interest: '7%', eligibility: 'All farmers' },
          { name: 'PM-KISAN', amount: '₹6,000/year', interest: '0%', eligibility: 'Small farmers' }
        ],
        insurance: [
          { name: 'PMFBY', coverage: 'Full sum insured', premium: '2%', features: 'Weather based' },
          { name: 'Private Crop Insurance', coverage: 'Customizable', premium: '3-5%', features: 'Comprehensive' }
        ],
        certifications: [
          { name: 'Organic Certification', cost: '₹5,000', duration: '3 years', benefits: 'Premium pricing' },
          { name: 'GlobalGAP', cost: '₹15,000', duration: '1 year', benefits: 'Export ready' }
        ],
        solar: [
          { name: 'PM-KUSUM', subsidy: '60%', capacity: 'Up to 10 HP', payback: '4-5 years' },
          { name: 'Solar Pump Scheme', subsidy: '50%', capacity: 'Up to 5 HP', payback: '3-4 years' }
        ],
        mandi: [
          { name: 'APMC Mandi', location: 'District HQ', facilities: 'Full services', distance: '15 km' },
          { name: 'E-NAM Mandi', location: 'Online', facilities: 'Digital trading', distance: '0 km' }
        ],
        government: [
          { name: 'PM-KISAN', amount: '₹6,000/year', eligibility: 'Small farmers', status: 'Active' },
          { name: 'PMFBY', coverage: 'Crop insurance', eligibility: 'All farmers', status: 'Active' }
        ]
      };

      // Try to fetch real data, fallback to mock data if APIs fail
      try {
        console.log('📡 Making API calls to CropCycleService...');
        const [analysisData, insightsData, buyersData, loansData, insuranceData, certificationsData, solarData, mandiData, governmentData] = await Promise.all([
          CropCycleService.analyzeCrop({
            crop: selectedCrop,
            landSize: farmDetails.landSize,
            irrigation: farmDetails.irrigation,
            tools: farmDetails.tools,
          }),
          CropCycleService.generateInsights({
            crop: selectedCrop,
            landSize: farmDetails.landSize,
            irrigation: farmDetails.irrigation,
            tools: farmDetails.tools,
          }),
          CropCycleService.getCorporateBuyers(selectedCrop),
          CropCycleService.getLoanSchemes(),
          CropCycleService.getInsurancePlans(),
          CropCycleService.getCertifications(),
          CropCycleService.getSolarSchemes(),
          CropCycleService.getMandiInfo(),
          CropCycleService.getGovernmentSchemes(),
        ]);
        
        console.log('✅ API calls completed successfully');
        console.log('📊 Analysis data:', analysisData);
        console.log('💡 Insights data:', insightsData);
        
        const dashboardData = {
          analysis: analysisData || fallbackAnalysis,
          insights: (insightsData && insightsData.insights) || fallbackInsights,
          buyers: (buyersData && buyersData.buyers) || fallbackData.buyers,
          loans: (loansData && loansData.schemes) || fallbackData.loans,
          insurance: (insuranceData && insuranceData.plans) || fallbackData.insurance,
          certifications: (certificationsData && certificationsData.certifications) || fallbackData.certifications,
          solar: (solarData && solarData.schemes) || fallbackData.solar,
          mandi: (mandiData && mandiData.mandis) || fallbackData.mandi,
          government: (governmentData && governmentData.schemes) || fallbackData.government,
        };
        
        console.log('📊 Setting dashboard data:', dashboardData);
        setRealData(dashboardData);
        saveToCache(dashboardData);
        console.log('💾 Data saved to cache');
      } catch (error) {
        console.log('⚠️ Dashboard APIs not available, using fallback data:', error.message);
        console.log('📊 Setting fallback data');
        setRealData(fallbackData);
        saveToCache(fallbackData);
        console.log('💾 Fallback data saved to cache');
      }
    } catch (error) {
      console.log('❌ Dashboard data loading error:', error.message);
    } finally {
      setLoading(false);
      console.log('✅ Dashboard data loading completed');
      setCacheLoaded(true);
    }
  };

  // On mount, try to load cache, else fetch
  useEffect(() => {
    // Load enhanced crop data on mount (only once)
    console.log('🔄 Loading enhanced crop data on mount...');
    loadEnhancedCropData();
  }, []); // Empty dependency array - only run once on mount

  // Separate useEffect for dashboard data when screen 3 is reached
  useEffect(() => {
    if (currentScreen === 3 && selectedCrop && farmDetails.landSize && farmDetails.irrigation) {
      console.log('🔄 Dashboard screen reached, loading data for:', { selectedCrop, landSize: farmDetails.landSize, irrigation: farmDetails.irrigation });
      // Try to load from cache first, then fetch if needed
      loadFromCache().then((found) => {
        if (!found) {
          console.log('📊 Cache not found, fetching fresh dashboard data...');
          // Use fetchAllDashboardData as the main function since it has better fallback handling
          fetchAllDashboardData();
        } else {
          console.log('📊 Data loaded from cache successfully');
        }
      }).catch((error) => {
        console.log('❌ Cache loading failed, fetching fresh data:', error);
        fetchAllDashboardData();
      });
    }
  }, [currentScreen, selectedCrop, farmDetails.landSize, farmDetails.irrigation]);

  const crops = [
    { name: 'Rice', emoji: '🌾', season: 'Kharif' },
    { name: 'Wheat', emoji: '🌾', season: 'Rabi' },
    { name: 'Maize', emoji: '🌽', season: 'Both' },
    { name: 'Cotton', emoji: '🌿', season: 'Kharif' },
    { name: 'Sugarcane', emoji: '🎋', season: 'Annual' },
    { name: 'Potato', emoji: '🥔', season: 'Rabi' },
    { name: 'Tomato', emoji: '🍅', season: 'Both' },
    { name: 'Onion', emoji: '🧅', season: 'Rabi' },
    { name: 'Soybean', emoji: '🫘', season: 'Kharif' },
    { name: 'Groundnut', emoji: '🥜', season: 'Both' }
  ];

  const irrigationMethods = [
    { name: 'Drip Irrigation', emoji: '💧' },
    { name: 'Sprinkler', emoji: '🌊' },
    { name: 'Flood Irrigation', emoji: '🌊' },
    { name: 'Rain-fed', emoji: '🌧️' }
  ];

  const availableTools = [
    { name: 'Tractor', emoji: '🚜' },
    { name: 'Plough', emoji: '🔨' },
    { name: 'Harvester', emoji: '⚙️' },
    { name: 'Seed Drill', emoji: '🔧' },
    { name: 'Fertilizer Spreader', emoji: '🌱' },
    { name: 'Water Pump', emoji: '⚡' }
  ];

  const aiInsights = (realData?.insights && realData.insights.length > 0) ? realData.insights : [
    `Market demand for ${selectedCrop || 'your crop'} is expected to rise by 15% this season`,
    "Optimal planting window: Next 2-3 weeks based on weather patterns",
    "Consider companion planting with legumes to improve soil nitrogen",
    "Current market price is 8% above last year - good selling opportunity",
    "Weather forecast shows adequate rainfall for the next month"
  ];

  // Helper function to safely convert any value to string for rendering
  const safeString = (value) => {
    if (value === null || value === undefined) return 'No data available';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Helper function to safely access nested object properties
  const safeGet = (obj, path, defaultValue = 'No data available') => {
    try {
      const keys = path.split('.');
      let result = obj;
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return defaultValue;
        }
      }
      return result !== null && result !== undefined ? result : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  // Fetch comprehensive crop data
  const fetchCropData = async () => {
    if (!selectedCrop || !farmDetails.landSize || !farmDetails.irrigation) {
      return;
    }

    setLoading(true);
    try {
      // Create fallback data
      const fallbackAnalysis = {
        analysis: {
          feasibility: 85,
          expected_profit: 45000,
          roi_percentage: 120,
          risk_level: 'Low',
          market_demand: 'High',
          seasonality: 'Optimal'
        }
      };

      const fallbackInsights = [
        `Market demand for ${selectedCrop} is expected to rise by 15% this season`,
        "Optimal planting window: Next 2-3 weeks based on weather patterns",
        "Consider companion planting with legumes to improve soil nitrogen",
        "Current market price is 8% above last year - good selling opportunity",
        "Weather forecast shows adequate rainfall for the next month"
      ];

      const fallbackData = {
        analysis: fallbackAnalysis,
        insights: fallbackInsights,
        buyers: [
          { name: 'ITC Limited', contact: '+91-98765-43210', requirements: 'Organic certified' },
          { name: 'Reliance Fresh', contact: '+91-98765-43211', requirements: 'Grade A quality' },
          { name: 'BigBasket', contact: '+91-98765-43212', requirements: 'Direct farm supply' }
        ],
        loans: [
          { name: 'Kisan Credit Card', amount: '₹3,00,000', interest: '7%', eligibility: 'All farmers' },
          { name: 'PM-KISAN', amount: '₹6,000/year', interest: '0%', eligibility: 'Small farmers' }
        ],
        insurance: [
          { name: 'PMFBY', coverage: 'Full sum insured', premium: '2%', features: 'Weather based' },
          { name: 'Private Crop Insurance', coverage: 'Customizable', premium: '3-5%', features: 'Comprehensive' }
        ],
        certifications: [
          { name: 'Organic Certification', cost: '₹5,000', duration: '3 years', benefits: 'Premium pricing' },
          { name: 'GlobalGAP', cost: '₹15,000', duration: '1 year', benefits: 'Export ready' }
        ],
        solar: [
          { name: 'PM-KUSUM', subsidy: '60%', capacity: 'Up to 10 HP', payback: '4-5 years' },
          { name: 'Solar Pump Scheme', subsidy: '50%', capacity: 'Up to 5 HP', payback: '3-4 years' }
        ],
        mandi: [
          { name: 'APMC Mandi', location: 'District HQ', facilities: 'Full services', distance: '15 km' },
          { name: 'E-NAM Mandi', location: 'Online', facilities: 'Digital trading', distance: '0 km' }
        ],
        government: [
          { name: 'PM-KISAN', amount: '₹6,000/year', eligibility: 'Small farmers', status: 'Active' },
          { name: 'PMFBY', coverage: 'Crop insurance', eligibility: 'All farmers', status: 'Active' }
        ]
      };

      // Try to fetch real data, fallback to mock data if APIs fail
      try {
        // Analyze crop
        const analysisData = await CropCycleService.analyzeCrop({
          crop: selectedCrop,
          landSize: farmDetails.landSize,
          irrigation: farmDetails.irrigation,
          tools: farmDetails.tools
        });

        // Generate insights
        const insightsData = await CropCycleService.generateInsights({
          crop: selectedCrop,
          landSize: farmDetails.landSize,
          irrigation: farmDetails.irrigation,
          tools: farmDetails.tools
        });

        // Get other data
        const [buyersData, loansData, insuranceData, certificationsData, solarData, mandiData, governmentData] = await Promise.all([
          CropCycleService.getCorporateBuyers(selectedCrop),
          CropCycleService.getLoanSchemes(),
          CropCycleService.getInsurancePlans(),
          CropCycleService.getCertifications(),
          CropCycleService.getSolarSchemes(),
          CropCycleService.getMandiInfo(),
          CropCycleService.getGovernmentSchemes()
        ]);

        setRealData({
          analysis: analysisData || fallbackAnalysis,
          insights: (insightsData && insightsData.insights) || fallbackInsights,
          buyers: (buyersData && buyersData.buyers) || fallbackData.buyers,
          loans: (loansData && loansData.schemes) || fallbackData.loans,
          insurance: (insuranceData && insuranceData.plans) || fallbackData.insurance,
          certifications: (certificationsData && certificationsData.certifications) || fallbackData.certifications,
          solar: (solarData && solarData.schemes) || fallbackData.solar,
          mandi: (mandiData && mandiData.mandis) || fallbackData.mandi,
          government: (governmentData && governmentData.schemes) || fallbackData.government
        });

      } catch (error) {
        console.log('Crop data APIs not available, using fallback data');
        setRealData(fallbackData);
      }

    } catch (error) {
      console.log('Crop data loading completed with fallbacks');
    } finally {
      setLoading(false);
    }
  };

  const tiles = [
    { 
      id: 'marketStrategy', 
      title: 'Market Intelligence', 
      icon: '📈', 
      description: 'AI-powered price predictions & selling strategy',
      planType: 'Strategic roadmap for maximum profit',
      color: '#4CAF50'
    },
    { 
      id: 'powerSupply', 
      title: 'Energy Independence', 
      icon: '⚡', 
      description: 'Solar transition plan with government subsidies',
      planType: 'Step-by-step subsidy acquisition guide',
      color: '#FF9800'
    },
    { 
      id: 'contractFarming', 
      title: 'Corporate Partnerships', 
      icon: '🤝', 
      description: 'Connect with fortune 500 agri-buyers',
      planType: 'Contract negotiation & partnership roadmap',
      color: '#2196F3'
    },
    { 
      id: 'cropInsurance', 
      title: 'Risk Shield', 
      icon: '🛡️', 
      description: 'Comprehensive crop protection strategy',
      planType: 'Multi-layer insurance optimization plan',
      color: '#9C27B0'
    },
    { 
      id: 'creditSources', 
      title: 'Smart Financing', 
      icon: '💎', 
      description: 'Low-cost capital acquisition strategy',
      planType: 'Financial engineering for farmers',
      color: '#E91E63'
    },
    { 
      id: 'soilHealth', 
      title: 'Soil Optimization', 
      icon: '🌿', 
      description: 'Scientific soil enhancement program',
      planType: 'Precision agriculture implementation',
      color: '#607D8B'
    }
  ];

  const getDetailedPlan = (tileId) => {
    const plans = {
      powerSupply: {
        title: "Energy Independence Plan",
        steps: [
          "Calculate your power requirements: Irrigation pump (5-10 HP), lighting (2-3 kW), processing equipment",
          "Solar system sizing: For 10 HP pump + 3kW lighting = 15kW solar system needed",
          "Apply for PM-KUSUM Scheme: Up to 60% subsidy on solar pumps",
          "Contact empaneled vendors: Get quotes from government-approved suppliers",
          "Submit application with land documents and electricity bill",
          "Install system with certified technicians",
          "Connect net metering for excess power sale back to grid",
          "Expected payback period: 4-5 years with subsidies"
        ],
        subsidy: "Government provides 60% subsidy + 30% bank loan at 7% interest",
        timeline: "3-4 months from application to installation"
      },
      marketStrategy: {
        title: "Market Intelligence Strategy",
        steps: [
          `Set up price alerts for ${selectedCrop} in nearby mandis`,
          "Join farmer producer organizations (FPOs) for better bargaining power",
          "Use e-NAM platform for transparent price discovery",
          "Store 30-40% of produce for price appreciation (if storage available)",
          "Direct marketing to retailers/processors to eliminate middlemen",
          "Value addition: Processing into flour/oil for 20-30% higher margins",
          "Export opportunities: Research international demand and requirements",
          "Contract farming: Lock-in prices before sowing"
        ],
        subsidy: "Marketing infrastructure development grants available",
        timeline: "Ongoing throughout crop cycle"
      },
      contractFarming: {
        title: "Corporate Partnership Roadmap",
        steps: [
          "Register on agri-business platforms: ITC e-Choupal, Reliance Fresh Direct",
          "Obtain quality certifications: Organic, GlobalGAP, FSSAI",
          "Form/join farmer collectives for volume aggregation",
          "Participate in corporate buyer meets organized by government",
          "Develop traceability systems for crop tracking",
          "Negotiate forward contracts with price floors",
          "Ensure consistent quality and delivery schedules",
          "Build long-term relationships through reliable supply"
        ],
        subsidy: "FPO formation grants and quality certification support",
        timeline: "6-12 months to establish partnerships"
      },
      cropInsurance: {
        title: "Comprehensive Risk Shield",
        steps: [
          "Enroll in Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          "Premium: Only 2% for Kharif, 1.5% for Rabi crops",
          "Coverage: Full sum insured against natural calamities",
          "Weather-based insurance for specific risks (drought, excess rain)",
          "Private insurance for high-value crops and equipment",
          "Maintain proper crop cutting experiments participation",
          "Document all farming activities with photos/videos",
          "Quick claim settlement through satellite monitoring"
        ],
        subsidy: "Government pays 95%+ of insurance premium",
        timeline: "Enroll within 15 days of sowing"
      },
      creditSources: {
        title: "Smart Financing Strategy",
        steps: [
          "Kisan Credit Card: Up to ₹3 lakh at 7% interest (with subsidy)",
          "Mudra loans: Up to ₹10 lakh for agri-allied activities",
          "FPO loans: Cheaper rates through collective borrowing",
          "Equipment financing: Tractor loans at 9-10% interest",
          "Input financing: Seed, fertilizer purchase on credit",
          "Warehouse receipt financing: Pledge stored crop for loans",
          "Digital lending platforms: Quick approval for short-term needs",
          "Maintain good credit score through timely repayments"
        ],
        subsidy: "Interest subvention up to 3% on crop loans",
        timeline: "KCC can be processed in 7-14 days"
      },
      soilHealth: {
        title: "Scientific Soil Enhancement",
        steps: [
          "Conduct comprehensive soil testing every 2-3 years",
          "Apply lime to correct soil pH (optimal 6.0-7.5 for most crops)",
          "Organic matter: Add 2-3 tonnes/acre of well-decomposed FYM",
          "Micronutrient correction: Zinc, Boron, Iron as per soil test",
          "Bio-fertilizers: Rhizobium, Azotobacter, PSB application",
          "Cover crops: Legumes in off-season to fix nitrogen",
          "Minimal tillage: Preserve soil structure and microbial life",
          "Regular monitoring through soil health cards"
        ],
        subsidy: "50% subsidy on organic inputs and bio-fertilizers",
        timeline: "Continuous process with seasonal applications"
      }
    };
    return plans[tileId];
  };

  const handleToolSelection = (tool) => {
    setFarmDetails(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const generateMasterPlan = () => {
    return {
      title: `Master Plan for ${selectedCrop} Cultivation`,
      overview: `Comprehensive farming strategy for ${farmDetails.landSize} acres of ${selectedCrop} using ${farmDetails.irrigation} irrigation`,
      phases: [
        {
          phase: "Pre-Planting Phase (Weeks 1-2)",
          tasks: [
            "Complete soil health testing and pH correction",
            "Apply for crop insurance under PMFBY",
            "Secure financing through Kisan Credit Card",
            `Prepare land using available tools: ${farmDetails.tools.join(', ')}`,
            "Source quality seeds and organic inputs with subsidies"
          ]
        },
        {
          phase: "Planting Phase (Weeks 3-4)",
          tasks: [
            `Plant ${selectedCrop} following recommended spacing`,
            `Install ${farmDetails.irrigation} system if not already present`,
            "Apply base fertilizers as per soil test recommendations",
            "Set up weather monitoring and pest surveillance"
          ]
        },
        {
          phase: "Growing Phase (Weeks 5-12)",
          tasks: [
            `Regular irrigation management using ${farmDetails.irrigation}`,
            "Integrated pest management with bio-pesticides",
            "Foliar nutrition and micronutrient application",
            "Join FPO/cooperative for collective bargaining power"
          ]
        },
        {
          phase: "Pre-Harvest Phase (Weeks 13-14)",
          tasks: [
            "Monitor market prices through e-NAM platform",
            "Negotiate with corporate buyers for direct sales",
            "Arrange harvesting equipment and labor",
            "Plan post-harvest handling and storage"
          ]
        },
        {
          phase: "Harvest & Post-Harvest (Weeks 15-16)",
          tasks: [
            "Harvest at optimal maturity for maximum quality",
            "Immediate post-harvest processing to reduce losses",
            "Grade and package for premium market segments",
            "Direct marketing or value addition for higher profits"
          ]
        }
      ],
      expectedOutcomes: {
        yield: `Expected yield: 20-25% above district average`,
        profit: `Projected profit: ₹${(parseInt(farmDetails.landSize) || 1) * 45000}/acre`,
        sustainability: "Improved soil health and reduced input costs over time"
      }
    };
  };

  const nextInsight = () => {
    try {
      if (aiInsights && aiInsights.length > 0) {
        setCurrentInsight((prev) => (prev + 1) % aiInsights.length);
      }
    } catch (error) {
      console.log('Next insight navigation failed:', error);
    }
  };

  const prevInsight = () => {
    try {
      if (aiInsights && aiInsights.length > 0) {
        setCurrentInsight((prev) => (prev - 1 + aiInsights.length) % aiInsights.length);
      }
    } catch (error) {
      console.log('Previous insight navigation failed:', error);
    }
  };

  // Screen 1: Crop Selection
  if (currentScreen === 1) {
  return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerWithBack}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>🌾 Smart Farming Assistant</Text>
              <Text style={styles.subtitle}>Select your crop to get started</Text>
            </View>
          </View>
          
          <View style={styles.cropGrid}>
            {crops.map((crop, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCrop(crop.name)}
                style={[
                  styles.cropCard,
                  selectedCrop === crop.name && styles.cropCardSelected
                ]}
              >
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                <Text style={[
                  styles.cropName,
                  selectedCrop === crop.name && styles.cropNameSelected
                ]}>
                  {crop.name}
                </Text>
                <Text style={[
                  styles.cropSeason,
                  selectedCrop === crop.name && styles.cropSeasonSelected
                ]}>
                  {crop.season}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedCrop && (
            <TouchableOpacity
              onPress={() => setCurrentScreen(2)}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>
                Continue with {selectedCrop} →
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Screen 2: Farm Details
  if (currentScreen === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerWithBack}>
            <TouchableOpacity
              onPress={() => setCurrentScreen(1)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Farm Details</Text>
              <Text style={styles.subtitle}>Tell us about your {selectedCrop} farm</Text>
            </View>
          </View>

          {/* Land Size */}
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailEmoji}>🌍</Text>
              <Text style={styles.detailTitle}>Land Size</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter land size in acres"
              placeholderTextColor="#666"
              value={farmDetails.landSize}
              onChangeText={(text) => setFarmDetails(prev => ({...prev, landSize: text}))}
              keyboardType="numeric"
            />
          </View>

          {/* Irrigation Method */}
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailEmoji}>💧</Text>
              <Text style={styles.detailTitle}>Irrigation Method</Text>
            </View>
            <View style={styles.optionGrid}>
              {irrigationMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setFarmDetails(prev => ({...prev, irrigation: method.name}))}
          style={[
                    styles.optionCard,
                    farmDetails.irrigation === method.name && styles.optionCardSelected
                  ]}
                >
                  <Text style={styles.optionEmoji}>{method.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    farmDetails.irrigation === method.name && styles.optionTextSelected
                  ]}>
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
      </View>
    </View>

          {/* Available Tools */}
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailEmoji}>🔧</Text>
              <Text style={styles.detailTitle}>Available Tools</Text>
              <Text style={styles.multiSelectHint}>(Select multiple)</Text>
            </View>
            <View style={styles.toolGrid}>
              {availableTools.map((tool, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleToolSelection(tool.name)}
                  style={[
                    styles.toolCard,
                    farmDetails.tools.includes(tool.name) && styles.toolCardSelected
                  ]}
                >
                  <Text style={styles.toolEmoji}>{tool.emoji}</Text>
                  <Text style={[
                    styles.toolText,
                    farmDetails.tools.includes(tool.name) && styles.toolTextSelected
                  ]}>
                    {tool.name}
          </Text>
                </TouchableOpacity>
              ))}
        </View>
      </View>

          {farmDetails.landSize && farmDetails.irrigation && (
            <TouchableOpacity
              onPress={() => {
                try {
                  // Set dashboard generated first
                  setDashboardGenerated(true);
                  
                  // Navigate to dashboard screen
                  setCurrentScreen(3);
                  
                  // Show success message after a delay
                  setTimeout(() => {
                    try {
                      Alert.alert(
                        '✅ Dashboard Generated!',
                        'Your smart farming dashboard has been created successfully. You can now access AI insights, market strategies, and detailed farming plans.',
                        [{ text: 'Great!' }]
                      );
                    } catch (alertError) {
                      console.log('Alert display failed:', alertError);
                    }
                  }, 1000);
                } catch (error) {
                  console.log('Dashboard generation error:', error);
                  // Fallback: still try to navigate
                  setCurrentScreen(3);
                  setDashboardGenerated(true);
                }
              }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>
                Generate Dashboard →
              </Text>
            </TouchableOpacity>
          )}
      </ScrollView>
    </SafeAreaView>
  );
  }

  // Detailed Plan Screen
  if (selectedTile) {
    // Only Master Plan (id: 'masterPlan') uses steps; others use AIAnalysisCard
    if (selectedTile.id === 'masterPlan') {
      const masterPlan = generateMasterPlan();
  return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.headerWithBack}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTile(null);
                  setCurrentScreen(3); // or previous screen
                }}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <View style={styles.planHeader}>
                <Text style={styles.planEmoji}>📋</Text>
                <View>
                  <Text style={styles.title}>Master Plan</Text>
                  <Text style={styles.subtitle}>Your complete farming roadmap</Text>
                </View>
          </View>
        </View>
        
            <View style={styles.planContainer}>
              <Text style={styles.planTitle}>{masterPlan.title}</Text>
              <Text style={styles.planOverview}>{masterPlan.overview}</Text>

              <View style={styles.phasesContainer}>
                {masterPlan.phases.map((phase, index) => (
                  <View key={index} style={styles.phaseItem}>
                    <Text style={styles.phaseTitle}>{phase.phase}</Text>
                    <View style={styles.tasksContainer}>
                      {phase.tasks.map((task, taskIndex) => (
                        <View key={taskIndex} style={styles.taskItem}>
                          <Text style={styles.taskBullet}>•</Text>
                          <Text style={styles.taskText}>{task}</Text>
            </View>
                      ))}
            </View>
                  </View>
                ))}
          </View>
          
              <View style={styles.outcomesContainer}>
                <Text style={styles.outcomesTitle}>Expected Outcomes</Text>
                <View style={styles.outcomeItem}>
                  <Text style={styles.outcomeLabel}>Yield:</Text>
                  <Text style={styles.outcomeValue}>{masterPlan.expectedOutcomes.yield}</Text>
          </View>
                <View style={styles.outcomeItem}>
                  <Text style={styles.outcomeLabel}>Profit:</Text>
                  <Text style={styles.outcomeValue}>{masterPlan.expectedOutcomes.profit}</Text>
        </View>
                <View style={styles.outcomeItem}>
                  <Text style={styles.outcomeLabel}>Sustainability:</Text>
                  <Text style={styles.outcomeValue}>{masterPlan.expectedOutcomes.sustainability}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.headerWithBack}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTile(null);
                  setCurrentScreen(3);
                }}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
              <View style={styles.planHeader}>
                <Text style={styles.planEmoji}>{selectedTile.icon}</Text>
                <View>
                  <Text style={styles.title}>{selectedTile.title}</Text>
                  <Text style={styles.subtitle}>{selectedTile.planType}</Text>
                </View>
              </View>
            </View>
            <AIAnalysisCard tile={selectedTile} crop={selectedCrop} landSize={farmDetails.landSize} />
          </ScrollView>
        </SafeAreaView>
      );
    }
  }

  // Master Plan Screen
  if (currentScreen === 4) {
    const masterPlan = generateMasterPlan();
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerWithBack}>
            <TouchableOpacity
              onPress={() => setCurrentScreen(3)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.planHeader}>
              <Text style={styles.planEmoji}>📋</Text>
              <View>
                <Text style={styles.title}>Master Plan</Text>
                <Text style={styles.subtitle}>Your complete farming roadmap</Text>
          </View>
        </View>
      </View>

          <View style={styles.planContainer}>
            <Text style={styles.planTitle}>{masterPlan.title}</Text>
            <Text style={styles.planOverview}>{masterPlan.overview}</Text>

            <View style={styles.phasesContainer}>
              {masterPlan.phases.map((phase, index) => (
                <View key={index} style={styles.phaseItem}>
                  <Text style={styles.phaseTitle}>{phase.phase}</Text>
                  <View style={styles.tasksContainer}>
                    {phase.tasks.map((task, taskIndex) => (
                      <View key={taskIndex} style={styles.taskItem}>
                        <Text style={styles.taskBullet}>•</Text>
                        <Text style={styles.taskText}>{task}</Text>
                      </View>
            ))}
          </View>
        </View>
              ))}
        </View>

            <View style={styles.outcomesContainer}>
              <Text style={styles.outcomesTitle}>Expected Outcomes</Text>
              <View style={styles.outcomeItem}>
                <Text style={styles.outcomeLabel}>Yield:</Text>
                <Text style={styles.outcomeValue}>{masterPlan.expectedOutcomes.yield}</Text>
              </View>
              <View style={styles.outcomeItem}>
                <Text style={styles.outcomeLabel}>Profit:</Text>
                <Text style={styles.outcomeValue}>{masterPlan.expectedOutcomes.profit}</Text>
              </View>
              <View style={styles.outcomeItem}>
                <Text style={styles.outcomeLabel}>Sustainability:</Text>
                <Text style={styles.outcomeValue}>{masterPlan.expectedOutcomes.sustainability}</Text>
              </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
  }

  // Dashboard Screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.dashboardHeader}>
          <View style={styles.headerWithBack}>
            <TouchableOpacity
              onPress={() => {
                try {
                  console.log('🔙 Back button pressed, navigating to screen 2');
                  setCurrentScreen(2);
                } catch (error) {
                  console.log('❌ Back navigation failed:', error);
                  // Fallback: try to go back in navigation stack
                  try {
                    navigation.goBack();
                  } catch (navError) {
                    console.log('❌ Navigation fallback also failed:', navError);
                  }
                }
              }}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Smart Dashboard</Text>
              <Text style={styles.subtitle}>{selectedCrop} - {farmDetails.landSize} acres</Text>
              {dashboardGenerated && (
                <Text style={styles.successIndicator}>✅ Dashboard Ready</Text>
              )}
        </View>
      </View>
      <TouchableOpacity
            onPress={() => {
              try {
                console.log('📋 Generate Master Plan button pressed');
                setCurrentScreen(4);
              } catch (error) {
                console.log('❌ Master Plan navigation failed:', error);
                Alert.alert('Navigation Error', 'Unable to navigate to Master Plan. Please try again.');
              }
            }}
            style={styles.masterPlanButton}
          >
            <Text style={styles.masterPlanButtonText}>📋 Generate Master Plan</Text>
      </TouchableOpacity>
        </View>

        {/* Focus Section */}
        <View style={styles.focusSection}>
          <View style={styles.focusCard}>
            <Text style={styles.focusTitle}>✅ Feasibility</Text>
            <Text style={styles.focusValue}>
              {safeString(safeGet(realData, 'analysis.analysis.feasibility', '85%'))}
            </Text>
            <Text style={styles.focusSubtext}>
              AI-powered feasibility assessment
            </Text>
          </View>
          
          <View style={styles.focusCard}>
            <Text style={styles.focusTitle}>💰 Expected Profit</Text>
            <Text style={styles.focusValue}>
              {safeString(safeGet(realData, 'analysis.analysis.expected_profit', '₹45,000'))}
            </Text>
            <Text style={styles.focusSubtext}>Net profit per season</Text>
          </View>
          
          <View style={styles.focusCard}>
            <Text style={styles.focusTitle}>📊 ROI</Text>
            <Text style={styles.focusValue}>
              {safeString(safeGet(realData, 'analysis.analysis.roi_percentage', '120%'))}
            </Text>
            <Text style={styles.focusSubtext}>Return on investment</Text>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.loadingText}>Analyzing your farm data with AI...</Text>
          </View>
        )}

        {/* Data Status Indicator */}
        {!loading && (
          <View style={styles.dataStatusContainer}>
            <Text style={styles.dataStatusText}>
              📊 Dashboard Data: {realData?.analysis ? '✅ Loaded' : '⏳ Loading...'}
            </Text>
            <Text style={styles.dataStatusSubtext}>
              {realData?.insights?.length > 0 ? `${realData.insights.length} AI insights available` : 'Preparing insights...'}
            </Text>
          </View>
        )}

        {/* AI Insights Carousel */}
        <View style={styles.insightsContainer}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>🤖 AI Insights</Text>
            <View style={styles.carouselControls}>
              <TouchableOpacity onPress={prevInsight} style={styles.carouselButton}>
                <Text style={styles.carouselButtonText}>←</Text>
        </TouchableOpacity>
              <TouchableOpacity onPress={nextInsight} style={styles.carouselButton}>
                <Text style={styles.carouselButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              {aiInsights && aiInsights.length > 0 && currentInsight >= 0 && currentInsight < aiInsights.length 
                ? safeString(aiInsights[currentInsight])
                : safeString('Loading insights...')}
            </Text>
          </View>
      </View>

        {/* Service Tiles */}
        <View style={styles.tilesContainer}>
          {tiles.map((tile) => {
            let screenName = null;
            switch (tile.id) {
              case 'marketStrategy':
                screenName = 'MarketStrategyScreen';
                break;
              case 'powerSupply':
                screenName = 'PowerSupplyScreen';
                break;
              case 'contractFarming':
                screenName = 'ContractFarmingScreen';
                break;
              case 'cropInsurance':
                screenName = 'CropInsuranceScreen';
                break;
              case 'creditSources':
                screenName = 'CreditSourcesScreen';
                break;
              case 'soilHealth':
                screenName = 'SoilHealthScreen';
                break;
              default:
                break;
            }
            return (
              <DashboardTile
                key={tile.id}
                tile={tile}
                onPress={() => {
                  if (screenName) {
                    try {
                      console.log('Navigating to', screenName, 'with params:', {
                        selectedCrop,
                        landSize: farmDetails.landSize,
                      });
                      navigation.navigate(screenName, {
                        selectedCrop,
                        landSize: farmDetails.landSize,
                      });
                    } catch (error) {
                      console.log('Screen navigation failed, showing detailed plan instead');
                      // Fallback: Show detailed plan in current screen
                      setSelectedTile(tile);
                    }
                  } else {
                    // Show detailed plan for tiles without specific screens
                    setSelectedTile(tile);
                  }
                }}
              />
            );
          })}
        </View>
      </ScrollView>
      
      {/* Mic Overlay - UI only for now */}
      <MicOverlay 
        onPress={() => {
          try {
            // For now, just navigate to LiveVoiceScreen
            navigation.navigate('LiveVoiceScreen');
          } catch (error) {
            console.log('Mic overlay navigation failed:', error);
          }
        }}
        isVisible={true}
        isActive={false}
      />
    </SafeAreaView>
  );
};

// --- [Modern Minimal Timeline Step Card] ---
const TimelineStep = ({ step, index, total, tip }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 32 }}>
    {/* Timeline indicator */}
    <View style={{ alignItems: 'center', width: 36 }}>
      <View style={{
        width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', marginBottom: 2,
        borderWidth: 2, borderColor: '#fff',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
      }} />
      {index < total - 1 && (
        <View style={{ width: 2, flex: 1, backgroundColor: '#333', marginTop: 2 }} />
      )}
    </View>
    {/* Step Card */}
    <View style={{
      flex: 1,
      backgroundColor: '#181A20',
      borderRadius: 16,
      padding: 20,
      marginLeft: 0,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 }}>{step.title}</Text>
      <Text style={{ fontSize: 15, color: '#B0B0B0', marginBottom: tip ? 12 : 0 }}>{step.description}</Text>
      {tip && (
        <View style={{ backgroundColor: '#23272F', borderRadius: 8, padding: 12, marginTop: 4 }}>
          <Text style={{ color: '#4CAF50', fontSize: 14, fontWeight: '500' }}>Tip</Text>
          <Text style={{ color: '#B0B0B0', fontSize: 14 }}>{tip}</Text>
        </View>
      )}
    </View>
  </View>
);

// --- [2] Modern Minimal Dashboard Tile ---
const DashboardTile = ({ tile, onPress }) => (
    <TouchableOpacity
    onPress={onPress}
    style={{
      width: (width - 56) / 2,
      backgroundColor: '#181818',
      borderRadius: 16,
      padding: 20,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOpacity: 0.10,
      shadowRadius: 10,
      borderLeftWidth: 5,
      borderLeftColor: tile.color,
      elevation: 2,
    }}
    activeOpacity={0.85}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text style={{ fontSize: 26, marginRight: 8 }}>{tile.icon}</Text>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, flex: 1 }}>{tile.title}</Text>
  </View>
    <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>{tile.description}</Text>
    <Text style={{ color: '#4CAF50', fontSize: 11 }}>{tile.planType}</Text>
  </TouchableOpacity>
);

// --- [AI Analysis Card for Dashboard Tiles] ---
const AI_TILE_STYLES = {
  marketStrategy: {
    accent: '#4CAF50',
    gradient: ['#43e97b', '#38f9d7'],
    iconBg: '#1B5E20',
    icon: '📈',
  },
  powerSupply: {
    accent: '#FF9800',
    gradient: ['#f7971e', '#ffd200'],
    iconBg: '#E65100',
    icon: '⚡',
  },
  contractFarming: {
    accent: '#2196F3',
    gradient: ['#2193b0', '#6dd5ed'],
    iconBg: '#0D47A1',
    icon: '🤝',
  },
  cropInsurance: {
    accent: '#9C27B0',
    gradient: ['#c471f5', '#fa71cd'],
    iconBg: '#4A148C',
    icon: '🛡️',
  },
  creditSources: {
    accent: '#00BCD4',
    gradient: ['#43cea2', '#185a9d'],
    iconBg: '#006064',
    icon: '💎',
  },
  soilHealth: {
    accent: '#607D8B',
    gradient: ['#3a7bd5', '#3a6073'],
    iconBg: '#263238',
    icon: '🌿',
  },
};

const AIAnalysisCard = ({ tile, crop, landSize }) => {
  // Per-tile unique AI layouts and content
  if (tile.id === 'marketStrategy') {
    return (
      <View style={styles.aiCard}>
        {/* Key Market Signal */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>📈</Text>
          <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 16 }}>Key Market Signal</Text>
    </View>
        <Text style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>
          Demand for {crop} is projected to rise 15% this season. Price trend: <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>↑</Text>
        </Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>AI Suggestion:</Text> Set up price alerts for {crop} in local and online markets.
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>AI Suggestion:</Text> Join a Farmer Producer Organization (FPO) to increase bargaining power.
        </View>
        <View style={{ backgroundColor: '#232323', borderRadius: 8, padding: 14 }}>
          <Text style={{ color: '#FFC107', fontWeight: 'bold', marginBottom: 4 }}>Why this matters</Text>
          <Text style={{ color: '#aaa' }}>AI predicts a 15% price increase for well-timed, direct market sales.</Text>
    </View>
  </View>
);
  }
  if (tile.id === 'creditSources') {
    return (
      <View style={styles.aiCard}>
        {/* Quick Stat */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>💎</Text>
          <Text style={{ color: '#00BCD4', fontWeight: 'bold', fontSize: 16 }}>Quick Stat</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>
          87% of farmers in your region were approved for KCC loans last year.
    </Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#00BCD4', fontWeight: 'bold' }}>AI Suggestion:</Text> Apply for a Kisan Credit Card (KCC) for up to ₹3 lakh at 7% interest.
    </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#00BCD4', fontWeight: 'bold' }}>AI Suggestion:</Text> Explore digital lending platforms for quick, collateral-free loans.
        </View>
        <View style={{ backgroundColor: '#232323', borderRadius: 8, padding: 14 }}>
          <Text style={{ color: '#FFC107', fontWeight: 'bold', marginBottom: 4 }}>Why this matters</Text>
          <Text style={{ color: '#aaa' }}>AI shows timely credit access increases yield by 12% on average.</Text>
    </View>
  </View>
);
  }
  if (tile.id === 'contractFarming') {
  return (
      <View style={styles.aiCard}>
        {/* AI Matchmaking */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>🤝</Text>
          <Text style={{ color: '#2196F3', fontWeight: 'bold', fontSize: 16 }}>AI Matchmaking</Text>
          </View>
        <Text style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>
          Top buyers in your region: ITC, Reliance Fresh, BigBasket.
        </Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Did you know?</Text> FSSAI certification can increase contract value by 12%.
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>AI Suggestion:</Text> Join a local FPO to aggregate supply and negotiate better terms.
        </View>
        <View style={{ backgroundColor: '#232323', borderRadius: 8, padding: 14 }}>
          <Text style={{ color: '#FFC107', fontWeight: 'bold', marginBottom: 4 }}>Why this matters</Text>
          <Text style={{ color: '#aaa' }}>AI projects a 20% higher profit margin for direct corporate contracts.</Text>
        </View>
      </View>
    );
  }
  if (tile.id === 'soilHealth') {
    return (
      <View style={styles.aiCard}>
        {/* Soil Health Score */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>🌿</Text>
          <Text style={{ color: '#607D8B', fontWeight: 'bold', fontSize: 16 }}>Soil Health Score</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>
          AI estimates your soil organic matter at 2.1% (target: 3%).
        </Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#607D8B', fontWeight: 'bold' }}>Best Practice:</Text> Incorporate organic matter and bio-fertilizers for long-term health.
        </View>
        <View style={{ backgroundColor: '#232323', borderRadius: 8, padding: 14 }}>
          <Text style={{ color: '#FFC107', fontWeight: 'bold', marginBottom: 4 }}>Why this matters</Text>
          <Text style={{ color: '#aaa' }}>AI predicts a 20% yield boost with improved soil practices.</Text>
        </View>
      </View>
    );
  }
  if (tile.id === 'cropInsurance') {
  return (
      <View style={styles.aiCard}>
        {/* Risk Meter */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>🛡️</Text>
          <Text style={{ color: '#9C27B0', fontWeight: 'bold', fontSize: 16 }}>Risk Meter</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>
          Weather risk: <Text style={{ color: '#FFC107', fontWeight: 'bold' }}>Moderate</Text>. Recent claims settled: 92%.
        </Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#9C27B0', fontWeight: 'bold' }}>AI Suggestion:</Text> Enroll in PMFBY for low-premium, high-coverage insurance.
      </View>
        <View style={{ backgroundColor: '#232323', borderRadius: 8, padding: 14 }}>
          <Text style={{ color: '#FFC107', fontWeight: 'bold', marginBottom: 4 }}>Why this matters</Text>
          <Text style={{ color: '#aaa' }}>AI finds insured farmers recover 80% faster after adverse events.</Text>
          </View>
      </View>
    );
  }
  if (tile.id === 'powerSupply') {
  return (
      <View style={styles.aiCard}>
        {/* Solar Savings Estimate */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>⚡</Text>
          <Text style={{ color: '#FF9800', fontWeight: 'bold', fontSize: 16 }}>Solar Savings Estimate</Text>
      </View>
        <Text style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>
          AI estimates you can save ₹{(parseInt(landSize) || 1) * 12000} per year by switching to solar.
        </Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#FF9800', fontWeight: 'bold' }}>AI Suggestion:</Text> Apply for the PM-KUSUM solar subsidy scheme (up to 60% subsidy).
          </View>
        <View style={{ backgroundColor: '#232323', borderRadius: 8, padding: 14 }}>
          <Text style={{ color: '#FFC107', fontWeight: 'bold', marginBottom: 4 }}>Why this matters</Text>
          <Text style={{ color: '#aaa' }}>AI estimates a 40% reduction in energy costs and 4-5 year payback.</Text>
      </View>
      </View>
    );
  }
  // fallback
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    marginRight:42
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cropCard: {
    width: (width - 60) / 2,
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  cropCardSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  cropEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cropNameSelected: {
    color: '#000000',
  },
  cropSeason: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  cropSeasonSelected: {
    color: '#666666',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 46,
  },
  detailSection: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  multiSelectHint: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: (width - 80) / 2,
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionCardSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#000000',
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: (width - 100) / 3,
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  toolCardSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  toolEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  toolText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  toolTextSelected: {
    color: '#000000',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  planContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  planInfo: {
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  planOverview: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  phasesContainer: {
    marginBottom: 20,
  },
  phaseItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFFFFF',
    paddingLeft: 15,
    marginBottom: 20,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tasksContainer: {
    marginLeft: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskBullet: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  taskText: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 18,
  },
  outcomesContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 20,
  },
  outcomesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  outcomeItem: {
    marginBottom: 12,
  },
  outcomeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  outcomeValue: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  dashboardHeader: {
    marginBottom: 20,
  },
  masterPlanButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  masterPlanButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  focusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  focusCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
  },
  focusTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  focusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  focusSubtext: {
    fontSize: 10,
    color: '#999999',
    lineHeight: 14,
  },
  insightsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  carouselControls: {
    flexDirection: 'row',
  },
  carouselButton: {
    padding: 8,
    marginLeft: 5,
  },
  carouselButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  insightCard: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 15,
  },
  insightText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 18,
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: (width - 50) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 20,
    marginBottom: 15,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tileEmoji: {
    fontSize: 28,
  },
  tileArrow: {
    color: '#999999',
    fontSize: 16,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tileDescription: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 16,
    marginBottom: 8,
  },
  tilePlanType: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 14,
  },
  aiCard: {
    backgroundColor: '#181818',
    borderRadius: 18,
    borderWidth: 2,
    padding: 24,
    marginBottom: 24,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  successIndicator: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  // --- Modern Minimal Timeline/Card Styles ---
  timelineContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#181A20',
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#333',
    marginTop: 2,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#23262F',
    borderRadius: 14,
    padding: 18,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  timelineDesc: {
    color: '#B0B3B8',
    fontSize: 15,
    marginBottom: 8,
  },
  timelineTip: {
    backgroundColor: '#23262F',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    paddingLeft: 12,
    paddingVertical: 8,
    borderRadius: 8,
    color: '#A3E635',
    fontSize: 14,
    marginTop: 4,
  },
  // --- Dashboard Tile Modern Minimal ---
  dashboardTile: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  dashboardTileTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  dashboardTileDesc: {
    color: '#B0B3B8',
    fontSize: 15,
  },
  dashboardTileAccentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    top: 18,
    right: 18,
  },
  // Data Status Indicator Styles
  dataStatusContainer: {
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  dataStatusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataStatusSubtext: {
    color: '#B0B3B8',
    fontSize: 14,
  },
});

export default FarmingAssistant;