import { Alert } from 'react-native';
import NetworkConfig from '../utils/NetworkConfig';

class SuicidePreventionService {
  constructor() {
    this.baseURL = NetworkConfig.API_BASE;
  }

  /**
   * Initiate an emergency call using the backend VAPI integration
   * @param {string} phoneNumber - The phone number to call (in E.164 format)
   * @param {string} recipientName - Optional recipient name
   * @param {string} message - Optional custom message
   * @returns {Promise<Object>} - Response from the API
   */
  async initiateEmergencyCall(phoneNumber, recipientName = null, message = null) {
    try {
      // Use NetworkConfig's safeFetch for better error handling
      const response = await NetworkConfig.safeFetch('/suicide-prevention/emergency-call', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: "+917020744317", // Fixed working number
          recipient_name: recipientName,
          message: message,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initiating emergency call:', error);
      throw error;
    }
  }

  /**
   * Get list of available helpline numbers
   * @returns {Promise<Object>} - List of helplines
   */
  async getHelplines() {
    try {
      const response = await NetworkConfig.safeFetch('/suicide-prevention/helplines', {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching helplines:', error);
      throw error;
    }
  }

  /**
   * Health check for the suicide prevention service
   * @returns {Promise<Object>} - Health status
   */
  async healthCheck() {
    try {
      const response = await NetworkConfig.safeFetch('/suicide-prevention/health', {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in health check:', error);
      throw error;
    }
  }

  /**
   * Get the working phone number for Bland.ai calls
   * @returns {string} - Fixed working phone number
   */
  getWorkingPhoneNumber() {
    return "+917020744317"; // Fixed working number for Bland.ai
  }

  /**
   * Show confirmation dialog for emergency call
   * @param {string} phoneNumber - Phone number to call
   * @param {string} recipientName - Name of recipient
   * @param {Function} onConfirm - Callback when user confirms
   */
  showEmergencyCallConfirmation(phoneNumber, recipientName, onConfirm) {
    Alert.alert(
      'Emergency Call',
      `Initiate emergency call to ${recipientName || phoneNumber}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          style: 'destructive',
          onPress: onConfirm,
        },
      ]
    );
  }

  /**
   * Handle emergency call with proper error handling and user feedback
   * @param {string} phoneNumber - Phone number to call (not used, fixed number used)
   * @param {string} recipientName - Name of recipient
   */
  async handleEmergencyCall(phoneNumber, recipientName) {
    try {
      // Use the fixed working phone number
      const workingNumber = this.getWorkingPhoneNumber();
      
      // Show confirmation dialog
      this.showEmergencyCallConfirmation(workingNumber, recipientName, async () => {
        try {
          // Show loading state (you can implement this in your UI)
          console.log('Initiating emergency call with Bland.ai...');
          
          // Make the API call
          const result = await this.initiateEmergencyCall(workingNumber, recipientName);
          
          // Show success message
          Alert.alert(
            'Success',
            'Emergency call has been initiated. A counselor will contact you shortly.',
            [{ text: 'OK' }]
          );
          
          console.log('Emergency call initiated successfully:', result);
        } catch (error) {
          // Show error message
          Alert.alert(
            'Error',
            'Failed to initiate emergency call. Please try again or call the helpline directly.',
            [{ text: 'OK' }]
          );
          
          console.error('Emergency call failed:', error);
        }
      });
    } catch (error) {
      console.error('Error in handleEmergencyCall:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }
}

// Create and export a singleton instance
const suicidePreventionService = new SuicidePreventionService();
export default suicidePreventionService; 