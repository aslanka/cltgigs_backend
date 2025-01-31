import axios from 'axios';
console.log('API Base URL:', import.meta.env.VITE_API_URL);

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // Add this line
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(token);
  return config;
});

export default instance;
