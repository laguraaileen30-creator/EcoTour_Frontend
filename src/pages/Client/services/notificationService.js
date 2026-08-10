import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export const getNotifications = () => {
  return axios.get(`${API_URL}/notifications`);
};

export const markAsRead = (id) => {
  return axios.put(`${API_URL}/notifications/${id}/read`);
};

export const deleteNotification = (id) => {
  return axios.delete(`${API_URL}/notifications/${id}`);
};