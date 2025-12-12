import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Get meeting details
 */
export const getMeetingDetails = async (meetingId) => {
  const response = await axios.get(`${API_BASE_URL}/meetings/${meetingId}`, {
    withCredentials: true
  });
  return response.data;
};

/**
 * Get join credentials for a meeting
 */
export const getJoinCredentials = async (meetingId) => {
  const response = await axios.get(`${API_BASE_URL}/meetings/${meetingId}/join`, {
    withCredentials: true
  });
  return response.data;
};

/**
 * Record join event when user/mentor enters the meeting room
 */
export const recordJoinEvent = async (meetingId) => {
  const response = await axios.post(
    `${API_BASE_URL}/meetings/${meetingId}/join-event`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Record leave event when user/mentor exits the meeting room
 */
export const recordLeaveEvent = async (meetingId) => {
  const response = await axios.post(
    `${API_BASE_URL}/meetings/${meetingId}/leave-event`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

/**
 * End meeting (mentor only)
 */
export const endMeeting = async (meetingId) => {
  const response = await axios.post(
    `${API_BASE_URL}/meetings/${meetingId}/end`,
    {},
    { withCredentials: true }
  );
  return response.data;
};
