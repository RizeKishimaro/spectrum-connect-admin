import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000', // change to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or your token key
    console.log(token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to catch invalid tokens
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Handle invalid/expired token
    // if (status === 401 || status === 403) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login'; // Or use your router's push
    // }

    return Promise.reject(error);
  }
);

export default axiosClient;

