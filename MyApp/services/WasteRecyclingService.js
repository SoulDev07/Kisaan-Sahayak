import { NetworkConfig } from '../utils/NetworkConfig';

const API_BASE = NetworkConfig.API_BASE;

class WasteRecyclingService {
  /**
   * Analyze waste image using Gemini 2.5 Flash
   * @param {Object} imageData - Image data from image picker
   * @param {string} location - Location context
   * @param {string} farmerId - Farmer ID
   * @returns {Promise<Object>} Analysis results
   */
  static async analyzeWaste(imageData, location = 'farm', farmerId = 'f001') {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageData.uri,
        type: 'image/jpeg',
        name: 'waste_image.jpg',
      });
      formData.append('location', location);
      formData.append('farmer_id', farmerId);

      const response = await fetch(`${API_BASE}/waste-recycling/analyze-waste`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error analyzing waste:', error);
      return {
        success: false,
        error: error.message,
        data: {
          ai_suggestions: [
            "Compost organic waste to create nutrient-rich soil amendment",
            "Use crop residues as mulch to retain soil moisture",
            "Convert agricultural waste into biochar for soil improvement",
            "Implement vermicomposting for faster organic matter breakdown",
            "Create raised beds using recycled materials"
          ],
          common_practices: [],
          image_analyzed: false,
          location: location,
          farmer_id: farmerId
        }
      };
    }
  }

  /**
   * Get common recycling practices
   * @returns {Promise<Object>} Common practices data
   */
  static async getCommonPractices() {
    try {
      const response = await fetch(`${API_BASE}/waste-recycling/common-practices`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching common practices:', error);
      // Return fallback data
      return {
        success: false,
        error: error.message,
        data: {
          practices: [
            {
              id: 1,
              title: "Composting",
              description: "Convert organic waste into nutrient-rich compost for your fields",
              icon: "🌱",
              difficulty: "Easy",
              time_required: "2-3 months",
              materials_needed: ["Organic waste", "Container", "Water"],
              steps: [
                "Collect kitchen scraps and garden waste",
                "Layer with soil and water",
                "Turn regularly for aeration",
                "Use when dark and crumbly"
              ]
            },
            {
              id: 2,
              title: "Mulching",
              description: "Use waste materials as protective covering for soil",
              icon: "🍂",
              difficulty: "Very Easy",
              time_required: "Immediate",
              materials_needed: ["Leaves", "Straw", "Wood chips"],
              steps: [
                "Collect dry leaves and plant waste",
                "Spread 2-3 inches thick around plants",
                "Keep away from plant stems",
                "Replenish as needed"
              ]
            },
            {
              id: 3,
              title: "Vermicomposting",
              description: "Use earthworms to break down organic waste quickly",
              icon: "🪱",
              difficulty: "Medium",
              time_required: "1-2 months",
              materials_needed: ["Worms", "Container", "Bedding", "Food scraps"],
              steps: [
                "Set up worm bin with bedding",
                "Add worms and food scraps",
                "Maintain moisture and temperature",
                "Harvest worm castings"
              ]
            }
          ],
          total_count: 3
        }
      };
    }
  }

  /**
   * Get practice details by ID
   * @param {number} practiceId - Practice ID
   * @returns {Promise<Object>} Practice details
   */
  static async getPracticeDetails(practiceId) {
    try {
      const response = await fetch(`${API_BASE}/waste-recycling/practice/${practiceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching practice details:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Save analysis results
   * @param {string} farmerId - Farmer ID
   * @param {string} imageData - Image data (base64 or URI)
   * @param {Array} suggestions - AI suggestions
   * @param {string} location - Location
   * @returns {Promise<Object>} Save result
   */
  static async saveAnalysis(farmerId, imageData, suggestions, location) {
    try {
      const formData = new FormData();
      formData.append('farmer_id', farmerId);
      formData.append('image_data', imageData);
      formData.append('suggestions', JSON.stringify(suggestions));
      formData.append('location', location);

      const response = await fetch(`${API_BASE}/waste-recycling/save-analysis`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error saving analysis:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get farmer's analysis history
   * @param {string} farmerId - Farmer ID
   * @returns {Promise<Object>} Analysis history
   */
  static async getFarmerHistory(farmerId) {
    try {
      const response = await fetch(`${API_BASE}/waste-recycling/farmer-history/${farmerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching farmer history:', error);
      return {
        success: false,
        error: error.message,
        data: {
          farmer_id: farmerId,
          history: [],
          total_analyses: 0
        }
      };
    }
  }

  /**
   * Test API connectivity
   * @returns {Promise<boolean>} Connection status
   */
  static async testConnection() {
    try {
      const response = await fetch(`${API_BASE}/waste-recycling/common-practices`);
      return response.ok;
    } catch (error) {
      console.error('Waste recycling API connection test failed:', error);
      return false;
    }
  }
}

export default WasteRecyclingService; 