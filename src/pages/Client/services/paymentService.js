import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export const createPayment = (bookingId, data) => {
  return axios.post(`${API_URL}/payments`, { bookingId, ...data });
};

export const getPaymentStatus = (bookingId) => {
  return axios.get(`${API_URL}/payments/status/${bookingId}`);
};