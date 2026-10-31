import apiHelper, { BASE_URL } from "../../../helpers/apiHelper";

// ─────────────────────────────────────────────────────────────
// NestJS langsung return array/object dari Sequelize — tanpa wrapper { data: [] }
// ─────────────────────────────────────────────────────────────

// ── SEJARAH & IDENTITAS ──────────────────────────────────────
async function getSejarahIdentitas() {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas`, { method: "GET" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function postSejarahIdentitas(tahun_berdiri, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tahun_berdiri, deskripsi }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function putSejarahIdentitas(id, tahun_berdiri, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tahun_berdiri, deskripsi }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function deleteSejarahIdentitas(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}

// ── VISI & MISI ──────────────────────────────────────────────
async function getVisiMisi() {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi`, { method: "GET" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json(); // [{ id, tipe: "visi"|"misi", deskripsi }]
}
async function postVisiMisi(tipe, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipe, deskripsi }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function putVisiMisi(id, tipe, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipe, deskripsi }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function deleteVisiMisi(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}

// ── STRUKTUR ORGANISASI (upload file: field "gambar") ────────
async function getStrukturOrganisasi() {
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi`, { method: "GET" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function postStrukturOrganisasi(gambarFile) {
  const fd = new FormData(); fd.append("gambar", gambarFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi`, { method: "POST", body: fd });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function putStrukturOrganisasi(id, gambarFile) {
  const fd = new FormData(); fd.append("gambar", gambarFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi/${id}`, { method: "PUT", body: fd });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function deleteStrukturOrganisasi(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}

// ── FASILITAS (upload file: field "foto") ────────────────────
async function getFasilitas() {
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas`, { method: "GET" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function postFasilitas(nama_fasilitas, deskripsi, fotoFile) {
  const fd = new FormData();
  fd.append("nama_fasilitas", nama_fasilitas);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (fotoFile) fd.append("foto", fotoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas`, { method: "POST", body: fd });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function putFasilitas(id, nama_fasilitas, deskripsi, fotoFile) {
  const fd = new FormData();
  if (nama_fasilitas) fd.append("nama_fasilitas", nama_fasilitas);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (fotoFile) fd.append("foto", fotoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas/${id}`, { method: "PUT", body: fd });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function deleteFasilitas(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}

// ── PRESTASI (JSON) ──────────────────────────────────────────
// tingkat: "kabupaten"|"provinsi"|"nasional"|"internasional"
async function getPrestasi() {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi`, { method: "GET" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function postPrestasi(judul, tingkat, tahun, keterangan) {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ judul, tingkat, tahun, keterangan }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function putPrestasi(id, judul, tingkat, tahun, keterangan) {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ judul, tingkat, tahun, keterangan }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function deletePrestasi(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}

// ── PROGRAM KEAHLIAN (JSON, icon = string emoji/url) ─────────
async function getProgramKeahlian() {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian`, { method: "GET" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function postProgramKeahlian(nama_jurusan, deskripsi, icon) {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama_jurusan, deskripsi, icon }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function putProgramKeahlian(id, nama_jurusan, deskripsi, icon) {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama_jurusan, deskripsi, icon }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function deleteProgramKeahlian(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}

// ── MITRA KERJASAMA (upload file: field "logo") ──────────────
async function getMitraKerjasama() {
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama`, { method: "GET" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function postMitraKerjasama(nama_mitra, deskripsi, logoFile) {
  const fd = new FormData();
  fd.append("nama_mitra", nama_mitra);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (logoFile) fd.append("logo", logoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama`, { method: "POST", body: fd });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function putMitraKerjasama(id, nama_mitra, deskripsi, logoFile) {
  const fd = new FormData();
  if (nama_mitra) fd.append("nama_mitra", nama_mitra);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (logoFile) fd.append("logo", logoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama/${id}`, { method: "PUT", body: fd });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}
async function deleteMitraKerjasama(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Gagal"); }
  return res.json();
}

const profilApi = {
  getSejarahIdentitas, postSejarahIdentitas, putSejarahIdentitas, deleteSejarahIdentitas,
  getVisiMisi, postVisiMisi, putVisiMisi, deleteVisiMisi,
  getStrukturOrganisasi, postStrukturOrganisasi, putStrukturOrganisasi, deleteStrukturOrganisasi,
  getFasilitas, postFasilitas, putFasilitas, deleteFasilitas,
  getPrestasi, postPrestasi, putPrestasi, deletePrestasi,
  getProgramKeahlian, postProgramKeahlian, putProgramKeahlian, deleteProgramKeahlian,
  getMitraKerjasama, postMitraKerjasama, putMitraKerjasama, deleteMitraKerjasama,
};

export default profilApi;
