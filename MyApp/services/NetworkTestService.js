// Simple network test
import { NetworkConfig } from '../utils/NetworkConfig';

export const testNetworkConnection = async () => {
  try {
    console.log('Testing network connections...');
    const results = await NetworkConfig.testConnection();
    
    console.log('Network test results:', results);
    
    const workingConnections = results.filter(r => r.status === 'success');
    if (workingConnections.length > 0) {
      console.log('✅ Found working connections:', workingConnections.map(c => c.url));
      return workingConnections[0].url;
    } else {
      console.log('❌ No working connections found');
      console.log('Error details:', results.map(r => `${r.url}: ${r.error}`));
      return null;
    }
  } catch (error) {
    console.error('Network test failed:', error);
    return null;
  }
};

// Fallback service with mock data for when backend is unavailable
export const createMockCropCycleService = () => {
  return {
    analyzeCrop: async (cropData) => {
      console.log('Using mock data for analyzeCrop');
      return {
        investment: 50000,
        revenue: 80000,
        profit_margin: '60%',
        roi: '60%',
        soil_score: 75,
        soil_ph: '6.5',
        nitrogen: 'Medium',
        phosphorus: 'Low',
        potassium: 'High',
        organic_matter: '2.1%',
        soil_type: 'Loam',
        risk_level: 'Medium',
        insurance_premium: '2.5%',
        claim_settlement: '90%',
        season: 'Kharif',
        power_cost: 15000,
        current_price: '2200',
        predicted_price: '2450',
        best_season: 'Kharif',
        trend: 'Upward'
      };
    },
    
    getCorporateBuyers: async (crop) => {
      console.log('Using mock data for getCorporateBuyers');
      return {
        buyers: [
          {
            name: 'Reliance Agri',
            logo: '🏢',
            rating: '4.5',
            farmers: 15000,
            premium: 15,
            contractPrice: 2600,
            marketPrice: 2200,
            requirements: 'Organic certification required, minimum 10 quintals',
            payment: 'Within 7 days',
            contract: '6 months',
            contact: '+91 9876543210'
          }
        ]
      };
    },
    
    getLoanSchemes: async () => {
      console.log('Using mock data for getLoanSchemes');
      return {
        schemes: [
          {
            name: 'Kisan Credit Card',
            provider: 'SBI',
            category: 'government',
            interest_rate: '7% p.a.',
            loan_amount: 'Up to ₹3 lakhs',
            tenure: '5 years',
            processing_time: '7-15 days',
            eligibility: 'Valid farmer ID, land documents',
            documents: 'Aadhaar, PAN, land records',
            contact: '+91 1800-425-3800'
          }
        ]
      };
    },
    
    getInsurancePlans: async () => {
      console.log('Using mock data for getInsurancePlans');
      return {
        plans: [
          {
            name: 'Pradhan Mantri Fasal Bima Yojana',
            provider: 'Government of India',
            type: 'government',
            premium_rate: '2% for Kharif',
            sum_insured: 'Up to ₹50,000/hectare',
            coverage: 'Natural calamities, pest attacks',
            duration: 'One crop season',
            benefits: 'Quick claim settlement, comprehensive coverage',
            claims_process: 'Online application, 72-hour assessment',
            contact: '+91 1800-180-1551'
          }
        ]
      };
    },
    
    getSolarSchemes: async () => {
      console.log('Using mock data for getSolarSchemes');
      return {
        schemes: [
          {
            name: 'PM-KUSUM Scheme',
            provider: 'Ministry of New and Renewable Energy',
            subsidy: '60% subsidy',
            system_size: '5-25 kW',
            cost: '₹50,000 - ₹2,50,000',
            annual_savings: '₹15,000 - ₹75,000',
            payback_period: '4-6 years',
            benefits: 'Reduce electricity bills, sell excess power',
            eligibility: 'Farmers with irrigation pumps',
            contact: '+91 1800-180-0000'
          }
        ]
      };
    },
    
    getSoilTestingLabs: async () => {
      console.log('Using mock data for getSoilTestingLabs');
      return {
        labs: [
          {
            name: 'State Soil Testing Laboratory',
            location: 'District Agriculture Office',
            distance: '15 km',
            cost: '₹50-100 per sample',
            report_time: '7-10 days',
            parameters: 'pH, NPK, Organic Matter',
            services: 'Soil testing, fertilizer recommendations',
            contact: '+91 9876543210'
          }
        ]
      };
    },
    
    getCertifications: async () => {
      console.log('Using mock data for getCertifications');
      return {
        certifications: [
          {
            name: 'Organic Certification',
            cost: '₹5,000-15,000',
            duration: '3 years validity',
            benefits: '20-30% premium prices',
            contact: '+91 9876543210'
          }
        ]
      };
    },
    
    generateInsights: async (cropData) => {
      console.log('Using mock data for generateInsights');
      return {
        insights: `Based on current market conditions and seasonal trends, ${cropData.crop} prices are expected to rise by 10-15% in the coming months. Consider storing your produce for better returns.`,
        recommendations: `1. Wait for peak season pricing\n2. Focus on quality grading for premium prices\n3. Consider direct buyer contracts\n4. Monitor weekly price trends`,
        current_price: '2200',
        predicted_price: '2450',
        best_season: 'Kharif',
        trend: 'Upward'
      };
    },
    
    initiateCall: async (phoneNumber) => {
      console.log('Using mock call initiation for:', phoneNumber);
      return {
        call_url: `tel:${phoneNumber}`,
        message: 'Call initiated successfully'
      };
    }
  };
};
