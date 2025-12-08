import api from '../axios'; // Import the configured axios instance

/**
 * Fetches all active and approved mentors.
 * @returns {Promise<object>} The server response with mentor data.
 */
export const getActiveMentors = async () => {
  // Use GET for fetching data
  const response = await api.get('/mentor/all-active');
  return response.data;
};

/**
 * Fetches a single mentor by their ID.
 * @param {string} mentorId - The ID of the mentor to fetch.
 * @returns {Promise<object>} The server response with mentor data.
 */
export const getMentorById = async (mentorId) => {
  const response = await api.get(`/mentor/${mentorId}`);
  return response.data;
};

/**
 * Submits the mentor application form.
 * (This route requires authentication)
 * @param {object} applicationData - The mentor registration form data.
 * @returns {Promise<object>} The server response.
 */
/**
 * Fetches the mentor's dashboard profile data.
 * This route sends cookies automatically for authentication.
 * @returns {Promise<object>} The server response with dashboard profile data.
 */
export const getDashboardProfile = async () => {
  const response = await api.get('/mentor/dashboard/profile');
  return response.data;
};

/**
 * Updates the mentor's pricing information.
 * This route sends cookies automatically for authentication.
 * @param {Array} pricingData - Array of pricing objects with type and price (for 15 minutes)
 * @returns {Promise<object>} The server response.
 */
export const updatePricing = async (pricingData) => {
  const response = await api.put('/mentor/dashboard/pricing', {
    pricing: pricingData
  });
  return response.data;
};

/**
 * Updates the mentor's profile information.
 * This route sends cookies automatically for authentication.
 * @param {FormData} formData - FormData object with profile fields
 * @returns {Promise<object>} The server response.
 */
export const updateProfile = async (formData) => {
  const response = await api.put('/mentor/dashboard/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Updates the mentor's pricing information for the new API format.
 * This route sends cookies automatically for authentication.
 * @param {Array} pricingData - Array of pricing objects with type and price (for 15 minutes)
 * @returns {Promise<object>} The server response.
 */
export const updatePricingNew = async (pricingData) => {
  const response = await api.put('/mentor/dashboard/pricing', {
    pricing: pricingData
  });
  return response.data;
};

/**
 * Updates the mentor's availability schedule.
 * This route sends cookies automatically for authentication.
 * @param {Array} availabilityData - Array of day objects with day and slots
 * @returns {Promise<object>} The server response.
 */
export const updateAvailability = async (availabilityData) => {
  const response = await api.put('/mentor/dashboard/availability', {
    availability: availabilityData
  });
  return response.data;
};

/**
 * Updates the mentor's profile photo.
 * This route sends cookies automatically for authentication.
 * @param {FormData} formData - FormData containing the profile photo file
 * @returns {Promise<object>} The server response.
 */
export const updateProfilePhoto = async (formData) => {
  // Create a new axios instance without the default Content-Type header for FormData
  const formDataApi = require('axios').create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
    withCredentials: true,
  });

  const response = await formDataApi.put('/mentor/dashboard/profile', formData, {
    // Let axios set the Content-Type header automatically for FormData
    // Don't explicitly set Content-Type for FormData as axios handles it correctly
  });
  return response.data;
};

/**
 * Updates the mentor's bio information.
 * This route sends cookies automatically for authentication.
 * @param {string} bio - The bio text to update
 * @returns {Promise<object>} The server response.
 */
export const updateBio = async (bio) => {
  const response = await api.put('/mentor/dashboard/profile', {
    experienceInfo: bio
  });
  return response.data;
};

/**
 * Updates the mentor's expertise areas.
 * This route sends cookies automatically for authentication.
 * @param {Array} expertiseData - Array of expertise strings
 * @returns {Promise<object>} The server response.
 */
export const updateExpertise = async (expertiseData) => {
  const response = await api.put('/expertise', {
    expertise: expertiseData
  });
  return response.data;
};

/**
 * Submits the mentor's completed profile (availability, pricing, etc.).
 * (This route requires token authentication)
 * @param {FormData} profileData - A FormData object containing the file and JSON strings.
 * @param {string} token - The access token from URL query parameter.
 * @returns {Promise<object>} The server response.
 */
export const completeMentorProfile = async (profileData, token) => {
  // Create a new axios instance without the default Content-Type header for FormData
  const formDataApi = require('axios').create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
    withCredentials: true,
  });

  const response = await formDataApi.post('/mentor/complete-profile', profileData, {
    // Let axios set the Content-Type header automatically for FormData
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Fetches available calendar slots for a mentor (PUBLIC - no auth required)
 * @param {string} mentorId - The ID of the mentor
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise<object>} The server response with calendar slots data
 */
export const getCalendarSlots = async (mentorId, startDate, endDate) => {
  const response = await api.get(`/mentors/${mentorId}/slots/calendar`, {
    params: { startDate, endDate }
  });
  return response.data;
};

/**
 * Fetches available slots for a specific date (PUBLIC - no auth required)
 * @param {string} mentorId - The ID of the mentor
 * @param {string} date - The date (YYYY-MM-DD)
 * @returns {Promise<object>} The server response with slots for the date
 */
export const getAvailableSlotsForDate = async (mentorId, date) => {
  console.log('Fetching slots for:', { mentorId, date, dateType: typeof date });
  try {
    const response = await api.get(`/mentors/${mentorId}/slots`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

