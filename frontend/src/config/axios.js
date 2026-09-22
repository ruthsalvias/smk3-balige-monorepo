// src/config/axios.js
import axios from 'axios';
import GATEWAY_URL from './gateway';
import { ambilToken, hapusSesi, tokenMasihBerlaku } from './sesi';

const apiGateway = axios.create({
  baseURL: `${GATEWAY_URL}/api`,
});

apiGateway.interceptors.request.use(
  (config) => {
    const token = ambilToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Sesi kedaluwarsa dibersihkan lalu user diarahkan ke halaman masuk.
apiGateway.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !tokenMasihBerlaku()) {
      hapusSesi();
      if (!window.location.pathname.startsWith('/masuk')) {
        window.location.assign('/masuk');
      }
    }
    return Promise.reject(error);
  },
);

export default apiGateway;
