import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export const getBookings = () => {
  return axios.get(`${API_URL}/bookings`);
};

export const getBookingById = (id) => {
  return axios.get(`${API_URL}/bookings/${id}`);
};

export const createBooking = (data) => {
  return axios.post(`${API_URL}/bookings`, data);
};

export const updateBooking = (id, data) => {
  return axios.put(`${API_URL}/bookings/${id}`, data);
};

export const cancelBooking = (id) => {
  return axios.delete(`${API_URL}/bookings/${id}`);
};