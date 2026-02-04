// api.js
import axios from 'axios';

const instance = axios.create({ withCredentials: true });

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('expiry');
      window.location.href = '/'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default instance;