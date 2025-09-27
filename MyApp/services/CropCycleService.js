import { NetworkConfig } from '../utils/NetworkConfig';

const { API_BASE } = NetworkConfig;

class CropCycleService {
  
  // ===== EXISTING METHODS =====
  
  // Analyze crop and get comprehensive recommendations
  static async analyzeCrop(cropData) {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/analyze-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: cropData.crop,
          land_size: parseFloat(cropData.landSize),
          irrigation_method: cropData.irrigation,
          available_tools: cropData.tools || [],
          location: cropData.location || 'India'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing crop:', error);
      throw error;
    }
  }

  // Get corporate buyers for a specific crop
  static async getCorporateBuyers(crop) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/corporate-buyers/${crop}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching corporate buyers:', error);
      throw error;
    }
  }

  // Get loan schemes
  static async getLoanSchemes() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/loan-schemes');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching loan schemes:', error);
      throw error;
    }
  }

  // Get insurance plans
  static async getInsurancePlans() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/insurance-plans');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
      throw error;
    }
  }

  // Get certifications
  static async getCertifications() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/certifications');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching certifications:', error);
      throw error;
    }
  }

  // Get solar schemes
  static async getSolarSchemes() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/solar-schemes');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching solar schemes:', error);
      throw error;
    }
  }

  // Get soil testing labs
  static async getSoilTestingLabs() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/soil-testing-labs');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching soil testing labs:', error);
      throw error;
    }
  }

  // Get mandi information
  static async getMandiInfo() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/mandi-info');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching mandi info:', error);
      throw error;
    }
  }

  // Get government schemes
  static async getGovernmentSchemes() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/government-schemes');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching government schemes:', error);
      throw error;
    }
  }

  // Generate AI insights
  static async generateInsights(cropData) {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: cropData.crop,
          land_size: parseFloat(cropData.landSize),
          irrigation_method: cropData.irrigation,
          available_tools: cropData.tools || [],
          location: cropData.location || 'India'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  // Search crop data
  static async searchCropData(query, docType = null, limit = 5) {
    try {
      const params = new URLSearchParams({
        query: query,
        limit: limit.toString()
      });
      
      if (docType) {
        params.append('doc_type', docType);
      }

      const response = await NetworkConfig.safeFetch(`/crop-cycle/search?${params}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching crop data:', error);
      throw error;
    }
  }

  // Initiate phone call
  static async initiateCall(phoneNumber) {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/initiate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/health');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  // ===== NEW COMPREHENSIVE CROP CYCLE MANAGEMENT METHODS =====

  // ===== CROP MASTER DATA =====

  /**
   * Get all available crops in the system
   */
  static async getAllCrops({ category = null, season = null, search = null } = {}) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (season) params.append('season', season);
      if (search) params.append('search', search);

      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all crops:', error);
      throw error;
    }
  }

  /**
   * Add new crop to system
   */
  static async addNewCrop(cropData) {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/crops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding new crop:', error);
      throw error;
    }
  }

  /**
   * Get crop details
   */
  static async getCropDetails(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops/${cropId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop details:', error);
      throw error;
    }
  }

  /**
   * Update crop information
   */
  static async updateCropDetails(cropId, updates) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops/${cropId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating crop details:', error);
      throw error;
    }
  }

  /**
   * Delete crop from system
   */
  static async deleteCrop(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops/${cropId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting crop:', error);
      throw error;
    }
  }

  // ===== CROP CYCLE MANAGEMENT =====

  /**
   * Get farmer's crop cycles
   */
  static async getFarmerCropCycles(farmerId, status = null) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer crop cycles:', error);
      throw error;
    }
  }

  /**
   * Start new crop cycle
   */
  static async startCropCycle(farmerId, cycleData) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cycleData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting crop cycle:', error);
      throw error;
    }
  }

  /**
   * Get crop cycle details
   */
  static async getCropCycleDetails(farmerId, cycleId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop cycle details:', error);
      throw error;
    }
  }

  /**
   * Update crop cycle
   */
  static async updateCropCycle(farmerId, cycleId, updates) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating crop cycle:', error);
      throw error;
    }
  }

  /**
   * End crop cycle
   */
  static async endCropCycle(farmerId, cycleId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error ending crop cycle:', error);
      throw error;
    }
  }

  /**
   * Update cycle progress
   */
  static async updateCycleProgress(farmerId, cycleId, progressData) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating cycle progress:', error);
      throw error;
    }
  }

  // ===== TASK MANAGEMENT =====

  /**
   * Get cycle tasks
   */
  static async getCycleTasks(farmerId, cycleId, status = null) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}/tasks?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cycle tasks:', error);
      throw error;
    }
  }

  /**
   * Add cycle task
   */
  static async addCycleTask(farmerId, cycleId, taskData) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding cycle task:', error);
      throw error;
    }
  }

  /**
   * Update cycle task
   */
  static async updateCycleTask(farmerId, cycleId, taskId, updates) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating cycle task:', error);
      throw error;
    }
  }

  /**
   * Delete cycle task
   */
  static async deleteCycleTask(farmerId, cycleId, taskId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/cycles/${cycleId}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting cycle task:', error);
      throw error;
    }
  }

  // ===== ANALYTICS & RECOMMENDATIONS =====

  /**
   * Get farmer crop analytics
   */
  static async getFarmerCropAnalytics(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/analytics`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer crop analytics:', error);
      throw error;
    }
  }

  /**
   * Get farmer crop recommendations
   */
  static async getFarmerCropRecommendations(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/farmer/${farmerId}/recommendations`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer crop recommendations:', error);
      throw error;
    }
  }

  // ===== KNOWLEDGE BASE =====

  /**
   * Get crop seasons information
   */
  static async getCropSeasons() {
    try {
      const response = await NetworkConfig.safeFetch('/crop-cycle/seasons');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop seasons:', error);
      throw error;
    }
  }

  /**
   * Get crop varieties
   */
  static async getCropVarieties(cropName) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/varieties/${cropName}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop varieties:', error);
      throw error;
    }
  }

  /**
   * Get crop best practices
   */
  static async getCropBestPractices(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/best-practices/${cropId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop best practices:', error);
      throw error;
    }
  }

  /**
   * Get common crop diseases
   */
  static async getCommonCropDiseases(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/diseases/${cropId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching common crop diseases:', error);
      throw error;
    }
  }

  /**
   * Get recommended fertilizers
   */
  static async getRecommendedFertilizers(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/fertilizers/${cropId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recommended fertilizers:', error);
      throw error;
    }
  }

  /**
   * Get irrigation schedule
   */
  static async getIrrigationSchedule(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/irrigation/${cropId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching irrigation schedule:', error);
      throw error;
    }
  }

  /**
   * Get crop stages
   */
  static async getCropStages(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops/${cropId}/stages`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop stages:', error);
      throw error;
    }
  }

  /**
   * Add crop stage
   */
  static async addCropStage(cropId, stageData) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops/${cropId}/stages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stageData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding crop stage:', error);
      throw error;
    }
  }

  /**
   * Update crop stage
   */
  static async updateCropStage(cropId, stageId, updates) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops/${cropId}/stages/${stageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating crop stage:', error);
      throw error;
    }
  }

  /**
   * Delete crop stage
   */
  static async deleteCropStage(cropId, stageId) {
    try {
      const response = await NetworkConfig.safeFetch(`/crop-cycle/crops/${cropId}/stages/${stageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting crop stage:', error);
      throw error;
    }
  }
}

export default CropCycleService;
