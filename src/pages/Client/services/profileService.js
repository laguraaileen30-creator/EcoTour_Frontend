import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export const getProfile = () => {
  return axios.get(`${API_URL}/profile`);
};

export const updateProfile = (data) => {
  return axios.put(`${API_URL}/profile`, data);
};

export const uploadAvatar = (formData) => {
  return axios.post(`${API_URL}/profile/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};