import apiHelper, { BASE_URL } from '../../../helpers/apiHelperManajemen';

// ============================
// SISWA
// ============================

async function getSiswa(limit = 20, offset = 0) {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Gagal ambil siswa');
  return res.json();
}

async function getSiswaById(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/${id}`);
  if (!res.ok) throw new Error('Siswa tidak ditemukan');
  return res.json();
}

async function postSiswa(data) {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal tambah siswa');
  return res.json();
}

async function putSiswa(id, data) {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal update siswa');
  return res.json();
}

async function deleteSiswa(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Gagal hapus siswa');
  return res.json();
}

async function searchSiswa(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/search?${query}`);
  if (!res.ok) throw new Error('Gagal search siswa');
  return res.json();
}

async function getStatsSiswa() {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/stats`);
  if (!res.ok) throw new Error('Gagal ambil statistik siswa');
  return res.json();
}

// UPLOAD FILE (rapor / skl / ijazah) — multipart/form-data, field: file
async function uploadSiswaFile(siswaId, type, file) {
  const formData = new FormData();
  formData.append('file', file);
  // Tidak set Content-Type — biarkan browser set boundary multipart otomatis
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/${siswaId}/upload/${type}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Gagal upload file ${type}`);
  return res.json();
}

// DOWNLOAD FILE (rapor / skl / ijazah)
// Admin: semua tipe. Siswa: hanya skl milik sendiri.
async function downloadFileSiswa(id, type) {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/${id}/download/${type}`);
  if (!res.ok) throw new Error('Gagal download file siswa');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// EXPORT EXCEL
async function exportSiswa(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/export${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Gagal export siswa');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data_siswa.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// IMPORT EXCEL
async function importSiswa(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/import`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Gagal import siswa');
  return res.json();
}

// pagination alias
async function getSiswaPage(limit = 20, offset = 0) {
  return getSiswa(limit, offset);
}

// ============================
// GURU
// ============================

async function getGuru(limit = 20, offset = 0) {
  const res = await apiHelper.fetchData(`${BASE_URL}/guru?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Gagal ambil guru');
  return res.json();
}

async function getGuruById(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/guru/${id}`);
  if (!res.ok) throw new Error('Guru tidak ditemukan');
  return res.json();
}

async function postGuru(data) {
  const res = await apiHelper.fetchData(`${BASE_URL}/guru`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal tambah guru');
  return res.json();
}

async function putGuru(id, data) {
  const res = await apiHelper.fetchData(`${BASE_URL}/guru/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal update guru');
  return res.json();
}

async function deleteGuru(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/guru/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Gagal hapus guru');
  return res.json();
}

async function searchGuru(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiHelper.fetchData(`${BASE_URL}/guru/search?${query}`);
  if (!res.ok) throw new Error('Gagal search guru');
  return res.json();
}

async function getTotalGuru() {
  const res = await apiHelper.fetchData(`${BASE_URL}/guru/total`);
  if (!res.ok) throw new Error('Gagal ambil total guru');
  return res.json();
}

// EXPORT EXCEL
async function exportGuru() {
  const res = await apiHelper.fetchData(`${BASE_URL}/guru/export`);
  if (!res.ok) throw new Error('Gagal export guru');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data_guru.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// IMPORT EXCEL
async function importGuru(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiHelper.fetchData(`${BASE_URL}/guru/import`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Gagal import guru');
  return res.json();
}

async function getGuruPage(limit = 20, offset = 0) {
  return getGuru(limit, offset);
}

// ============================
const manajemenApi = {
  // siswa
  getSiswa,
  getSiswaById,
  postSiswa,
  putSiswa,
  deleteSiswa,
  searchSiswa,
  getStatsSiswa,
  uploadSiswaFile,
  downloadFileSiswa,
  exportSiswa,
  importSiswa,
  getSiswaPage,

  // guru
  getGuru,
  getGuruById,
  postGuru,
  putGuru,
  deleteGuru,
  searchGuru,
  getTotalGuru,
  exportGuru,
  importGuru,
  getGuruPage,
};

export default manajemenApi;