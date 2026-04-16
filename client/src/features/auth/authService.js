import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

/**
 * Auth-related API service calls.
 */
const authService = {
  /**
   * Fetch or create user profile on our backend after Firebase auth.
   */
  async syncUserProfile(firebaseUser) {
    const { uid, email, displayName, photoURL } = firebaseUser;
    const response = await apiClient.post(ENDPOINTS.USER_PROFILE, {
      uid,
      email,
      displayName,
      photoURL,
    });
    return response.data;
  },

  /**
   * Get the current user's profile from the backend.
   */
  async getUserProfile() {
    const response = await apiClient.get(ENDPOINTS.USER_PROFILE);
    return response.data;
  },
};

export default authService;
