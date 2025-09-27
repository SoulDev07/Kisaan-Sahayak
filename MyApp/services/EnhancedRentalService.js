import { NetworkConfig } from '../utils/NetworkConfig';

/**
 * Enhanced Rental Service
 * Handles all equipment rental-related API calls
 */
class EnhancedRentalService {
  
  // ===== EQUIPMENT MANAGEMENT =====
  
  /**
   * Get all rental items with advanced filtering
   */
  static async getAllRentalItems({
    category = null,
    location = null,
    minPrice = null,
    maxPrice = null,
    availableOnly = true,
    sortBy = 'created_at',
    page = 1,
    limit = 20
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (availableOnly) params.append('available_only', 'true');
      params.append('sort_by', sortBy);
      params.append('page', page);
      params.append('limit', limit);

      const response = await NetworkConfig.safeFetch(`/rental/items?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching rental items:', error);
      throw error;
    }
  }

  /**
   * Get rental item details
   */
  static async getRentalItemDetails(itemId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/items/${itemId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching rental item details:', error);
      throw error;
    }
  }

  /**
   * Update rental item
   */
  static async updateRentalItem(itemId, updates) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating rental item:', error);
      throw error;
    }
  }

  /**
   * Delete rental item
   */
  static async deleteRentalItem(itemId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting rental item:', error);
      throw error;
    }
  }

  /**
   * List new equipment for rental
   */
  static async listEquipment(equipmentData) {
    try {
      const response = await NetworkConfig.safeFetch('/rental/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing equipment:', error);
      throw error;
    }
  }

  // ===== BOOKING SYSTEM =====

  /**
   * Book equipment
   */
  static async bookEquipment(bookingData) {
    try {
      const response = await NetworkConfig.safeFetch('/rental/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error booking equipment:', error);
      throw error;
    }
  }

  /**
   * Get farmer's bookings
   */
  static async getFarmerBookings(farmerId) {
    try {
      const params = new URLSearchParams();
      params.append('farmerId', farmerId);

      const response = await NetworkConfig.safeFetch(`/rental/bookings?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer bookings:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  static async getBookingDetails(bookingId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/bookings/${bookingId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(bookingId, status, notes = null) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Extend rental booking
   */
  static async extendBooking(bookingId, extensionData) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/bookings/${bookingId}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extensionData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error extending booking:', error);
      throw error;
    }
  }

  /**
   * Return rental equipment
   */
  static async returnEquipment(bookingId, returnData) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/bookings/${bookingId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error returning equipment:', error);
      throw error;
    }
  }

  // ===== AVAILABILITY & REVIEWS =====

  /**
   * Check item availability
   */
  static async checkAvailability(itemId, startDate, endDate) {
    try {
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);

      const response = await NetworkConfig.safeFetch(`/rental/items/${itemId}/availability?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  /**
   * Get item reviews
   */
  static async getItemReviews(itemId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/items/${itemId}/reviews`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching item reviews:', error);
      throw error;
    }
  }

  /**
   * Add item review
   */
  static async addItemReview(itemId, reviewData) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/items/${itemId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding item review:', error);
      throw error;
    }
  }

  // ===== CATEGORIES & ANALYTICS =====

  /**
   * Get rental categories
   */
  static async getRentalCategories() {
    try {
      const response = await NetworkConfig.safeFetch('/rental/categories');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching rental categories:', error);
      throw error;
    }
  }

  /**
   * Get popular rental items
   */
  static async getPopularItems() {
    try {
      const response = await NetworkConfig.safeFetch('/rental/analytics/popular');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching popular items:', error);
      throw error;
    }
  }

  /**
   * Get rental trends
   */
  static async getRentalTrends() {
    try {
      const response = await NetworkConfig.safeFetch('/rental/analytics/trends');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching rental trends:', error);
      throw error;
    }
  }

  // ===== FARMER-SPECIFIC =====

  /**
   * Get farmer's rental listings
   */
  static async getFarmerListings(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/farmer/${farmerId}/listings`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer listings:', error);
      throw error;
    }
  }

  /**
   * Get farmer's rentals (as renter)
   */
  static async getFarmerRentals(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/farmer/${farmerId}/rentals`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer rentals:', error);
      throw error;
    }
  }

  /**
   * Get farmer's rental income
   */
  static async getFarmerRentalIncome(farmerId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/farmer/${farmerId}/income`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching farmer rental income:', error);
      throw error;
    }
  }

  /**
   * Get rental earnings
   */
  static async getRentalEarnings(farmerId) {
    try {
      const params = new URLSearchParams();
      params.append('farmerId', farmerId);

      const response = await NetworkConfig.safeFetch(`/rental/earnings?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching rental earnings:', error);
      throw error;
    }
  }

  // ===== SEARCH & DISCOVERY =====

  /**
   * Search rental equipment
   */
  static async searchRental(query, farmerId) {
    try {
      const response = await NetworkConfig.safeFetch('/rental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, farmerId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching rental equipment:', error);
      throw error;
    }
  }

  /**
   * Get rental activity
   */
  static async getRentalActivity(farmerId) {
    try {
      const params = new URLSearchParams();
      params.append('farmerId', farmerId);

      const response = await NetworkConfig.safeFetch(`/rental/activity?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching rental activity:', error);
      throw error;
    }
  }

  /**
   * Get featured rentals
   */
  static async getFeaturedRentals(farmerId) {
    try {
      const params = new URLSearchParams();
      params.append('farmerId', farmerId);

      const response = await NetworkConfig.safeFetch(`/rental/featured?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching featured rentals:', error);
      throw error;
    }
  }

  // ===== PAYMENT MANAGEMENT =====

  /**
   * Process rental payment
   */
  static async processPayment(bookingId, paymentData) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/payments/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId) {
    try {
      const response = await NetworkConfig.safeFetch(`/rental/payments/${paymentId}/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
}

export default EnhancedRentalService;
