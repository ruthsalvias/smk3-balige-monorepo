import apiGateway from '../../../config/axios';
import GATEWAY_URL from '../../../config/gateway';

const PREFIX = '/portofolio';

/**
 * Membangun Header lengkap untuk menembus API Gateway Nginx dan Microservices.
 * Mengirimkan Token Bearer untuk lolos autentikasi Gateway, 
 * sekaligus menyertakan X-User info untuk identifikasi aktor.
 */
const buildUserHeaders = () => {
  const token = localStorage.getItem('token'); 
  const userId = localStorage.getItem('userId') || '';
  const username = localStorage.getItem('username') || '';
  const roles = localStorage.getItem('roles') || ''; 

  const headers = {};

  // 1. WAJIB untuk lolos dari Nginx API Gateway (Menghindari Error 401)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 2. Custom headers untuk dibaca oleh service-portofolio NestJS
  if (userId) headers['X-User-Id'] = userId;
  if (username) headers['X-User-Name'] = localStorage.getItem('userNama') || username;
  if (roles) headers['X-User-Roles'] = roles;

  return headers;
};

function buildQueryString(params = {}) {
  const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'undefined' ||
      value === 'null'
    ) {
      return acc;
    }
    return { ...acc, [key]: value };
  }, {});

  const query = new URLSearchParams(cleanedParams).toString();
  return query ? `?${query}` : '';
}

// ==========================================
// KUMPULAN FUNGSI TRANSAKSI API PORTOFOLIO
// ==========================================

async function createPortofolio(data) {
  const headers = buildUserHeaders();
  console.log("Memulai POST Portofolio, memeriksa Headers yang dikirim:", headers);

  const res = await apiGateway.post(`${PREFIX}`, data, { headers });
  return res.data;
}

async function getPortofolios(params = {}) {
  const query = buildQueryString(params);
  const res = await apiGateway.get(`${PREFIX}${query}`, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function getReviewPortofolios(params = {}) {
  const query = buildQueryString(params);
  const res = await apiGateway.get(`${PREFIX}/review${query}`, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function getMyPortofolios(params = {}) {
  const query = buildQueryString(params);
  const res = await apiGateway.get(`${PREFIX}/me${query}`, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function getPortofolioById(id) {
  const res = await apiGateway.get(`${PREFIX}/${id}`, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function updatePortofolio(id, data) {
  const res = await apiGateway.put(`${PREFIX}/${id}`, data, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function deletePortofolio(id) {
  const res = await apiGateway.delete(`${PREFIX}/${id}`, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function submitPortofolio(id) {
  const res = await apiGateway.put(`${PREFIX}/${id}/submit`, null, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function publishPortofolio(id) {
  const res = await apiGateway.put(`${PREFIX}/${id}/publish`, null, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function rejectPortofolio(id, reason) {
  const res = await apiGateway.put(`${PREFIX}/${id}/reject`, { reason }, {
    headers: buildUserHeaders(),
  });
  return res.data;
}

async function getAll(params = {}) {
  return getPortofolios(params);
}

async function getOne(id) {
  return getPortofolioById(id);
}

const portofolioApi = {
  createPortofolio,
  getAll,
  getPortofolios,
  getReviewPortofolios,
  getMyPortofolios,
  getOne,
  getPortofolioById,
  updatePortofolio,
  deletePortofolio,
  submitPortofolio,
  publishPortofolio,
  rejectPortofolio,
};

const GATEWAY_BASE_URL = GATEWAY_URL;

export function getPortofolioImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('data:')) return imagePath;
  // Bersihkan URL penuh (data lama) dan prefix "uploads/" yang redundan,
  // tetapi kembalikan selalu subfolder "portofolio/" ke posisinya supaya path
  // mengarah ke file asli di service-portofolio (uploads/portofolio/...).
  let nama = imagePath.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
  nama = nama.replace(/^uploads\/?/, '').replace(/^portofolio\//, '');
  nama = `portofolio/${nama}`;
  return `${GATEWAY_BASE_URL}/api/portofolio/uploads/${nama}`;
}

export default portofolioApi;