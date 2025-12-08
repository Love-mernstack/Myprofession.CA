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
