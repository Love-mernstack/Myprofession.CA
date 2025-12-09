import api from '../axios';

/**
 * Create a new booking with Razorpay order
 * POST /api/v1/booking/create
 * @param {Object} bookingData - {mentorId, slots: [{date, startTime, endTime, sessionType}]}
 * @returns {Promise<object>} Order details including Razorpay order ID
 */
export const createBooking = async (bookingData) => {
  const response = await api.post('/booking/create', bookingData);
  return response.data;
};

/**
 * Verify payment after successful Razorpay transaction
 * POST /api/v1/booking/verify
 * @param {Object} paymentData - {razorpay_payment_id, razorpay_order_id, razorpay_signature}
 * @returns {Promise<object>} Booking confirmation details
 */
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/booking/verify', paymentData);
  return response.data;
};

/**
 * Cancel a pending booking (releases locked slots)
 * POST /api/v1/booking/cancel
 * @param {string} orderId - The order ID to cancel
 * @returns {Promise<object>} Cancellation confirmation
 */
export const cancelBooking = async (orderId) => {
  const response = await api.post('/booking/cancel', { orderId });
  return response.data;
};

/**
 * Get user's bookings/sessions (for user dashboard)
 * GET /api/v1/user/bookings?status=Scheduled&page=1&limit=20&upcoming=true
 * @param {Object} params - Query parameters {status, page, limit, upcoming}
 * @returns {Promise<object>} User's bookings with pagination
 */
export const getUserBookings = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.upcoming !== undefined) queryParams.append('upcoming', params.upcoming);
  
  const response = await api.get(`/user/bookings?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get mentor's meetings (for mentor dashboard)
 * GET /api/v1/mentor/meetings?status=Scheduled&page=1&limit=20&upcoming=true
 * @param {Object} params - Query parameters {status, page, limit, upcoming}
 * @returns {Promise<object>} Mentor's meetings with pagination
 */
export const getMentorMeetings = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.upcoming !== undefined) queryParams.append('upcoming', params.upcoming);
  
  const response = await api.get(`/mentor/meetings?${queryParams.toString()}`);
  return response.data;
};

/**
 * Mentor cancels a meeting with refund
 * POST /api/v1/mentor/meetings/:meetingId/cancel
 * @param {string} meetingId - Meeting ID to cancel
 * @param {string} reason - Cancellation reason
 * @returns {Promise<object>} Cancellation confirmation
 */
export const cancelMentorMeeting = async (meetingId, reason) => {
  const response = await api.post(`/mentor/meetings/${meetingId}/cancel`, { reason });
  return response.data;
};
