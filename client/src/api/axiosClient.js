import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  withCredentials: true, // CRITICAL for HttpOnly cookie
});

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

export const setAccessToken = (token) => { accessToken = token; };

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.request.use(config => {
  if(accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if(error.response?.data?.expired && !original._retry) {
      if(isRefreshing) {
        return new Promise((resolve,reject)=>{
          failedQueue.push({resolve,reject});
        }).then(token=>{
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true; isRefreshing = true;
      try {
        const { data } = await axios.post('http://localhost:5002/api/auth/refresh', {}, { withCredentials: true });
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch(e) {
        processQueue(e, null);
        window.location.href = '/login';
        return Promise.reject(e);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;