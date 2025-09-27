import { NetworkConfig } from '../utils/NetworkConfig';

/**
 * Comprehensive Crop Marketplace Service
 * Handles all marketplace-related API calls
 */
class CropMarketplaceService {
  
  // ===== CROP LISTINGS =====
  
  /**
   * Get all marketplace crops with advanced filtering
   */
  static async getMarketplaceCrops({
    category = null,
    state = null,
    district = null,
    minPrice = null,
    maxPrice = null,
    organicOnly = false,
    availableOnly = true,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (state) params.append('state', state);
      if (district) params.append('district', district);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (organicOnly) params.append('organic_only', 'true');
      if (availableOnly) params.append('available_only', 'true');
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      params.append('page', page);
      params.append('limit', limit);

      const response = await NetworkConfig.safeFetch(`/marketplace/crops?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching marketplace crops:', error);
      throw error;
    }
  }

  /**
   * Add crop to marketplace
   */
  static async addCropToMarketplace(cropData) {
    try {
      const response = await NetworkConfig.safeFetch('/marketplace/crops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding crop to marketplace:', error);
      throw error;
    }
  }

  /**
   * Get specific crop details
   */
  static async getCropDetails(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/crops/${cropId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop details:', error);
      throw error;
    }
  }

  /**
   * Update crop listing
   */
  static async updateCropListing(cropId, updates) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/crops/${cropId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating crop listing:', error);
      throw error;
    }
  }

  /**
   * Remove crop from marketplace
   */
  static async removeCropFromMarketplace(cropId) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/crops/${cropId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing crop from marketplace:', error);
      throw error;
    }
  }

  // ===== SEARCH & DISCOVERY =====

  /**
   * Search crops using AI semantic search
   */
  static async searchCrops(query, limit = 10) {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      params.append('limit', limit);

      const response = await NetworkConfig.safeFetch(`/marketplace/crops/search?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching crops:', error);
      throw error;
    }
  }

  /**
   * Get crop categories
   */
  static async getCropCategories() {
    try {
      const response = await NetworkConfig.safeFetch('/marketplace/crops/categories');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crop categories:', error);
      throw error;
    }
  }

  /**
   * Get trending crops
   */
  static async getTrendingCrops() {
    try {
      const response = await NetworkConfig.safeFetch('/marketplace/analytics/trending');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching trending crops:', error);
      throw error;
    }
  }

  // ===== ORDER MANAGEMENT =====

  /**
   * Purchase crop from marketplace
   */
  static async buyCrop(cropId, orderData) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/crops/${cropId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error purchasing crop:', error);
      throw error;
    }
  }

  /**
   * Get orders with filters
   */
  static async getOrders({ farmerId = null, status = null, role = null } = {}) {
    try {
      const params = new URLSearchParams();
      if (farmerId) params.append('farmer_id', farmerId);
      if (status) params.append('status', status);
      if (role) params.append('role', role);

      const response = await NetworkConfig.safeFetch(`/marketplace/orders?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  static async getOrderDetails(orderId) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/orders/${orderId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId, status, notes = null) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // ===== FARMER-SPECIFIC =====

  /**
   * Get farmer's crop listings
   */
  static async getFarmerListings(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/farmer/${farmerId}/listings`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer listings:', error);
      throw error;
    }
  }

  /**
   * Get farmer's purchases
   */
  static async getFarmerPurchases(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/farmer/${farmerId}/purchases`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer purchases:', error);
      throw error;
    }
  }

  /**
   * Get farmer's favorite crops
   */
  static async getFarmerFavorites(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/farmer/${farmerId}/favorites`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer favorites:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite crop
   */
  static async toggleFavorite(cropId, farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/crops/${cropId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ farmer_id: farmerId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Negotiate price
   */
  static async negotiatePrice(cropId, negotiationData) {
    try {
      const response = await NetworkConfig.safeFetch(`/marketplace/crops/${cropId}/negotiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(negotiationData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error negotiating price:', error);
      throw error;
    }
  }
}

export default CropMarketplaceService;
