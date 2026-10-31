import apiHelper, { BASE_URL } from "../../../helpers/apiHelper";

// ─────────────────────────────────────────────────────────────
// NestJS langsung return array/object dari Sequelize — tanpa wrapper { data: [] }
// ─────────────────────────────────────────────────────────────

/**
 * Membaca respons dan melempar pesan yang bisa dibaca pengguna.
 *
 * Reverse proxy menjawab dengan halaman HTML saat unggahan ditolak (413) atau
 * backend tidak merespons (502/504). Tanpa penanganan ini `res.json()` gagal
 * dan yang muncul di layar adalah "Unexpected token '<'" — tidak memberi tahu
 * apa pun kepada pengguna.
 */
async function handle(res) {
  if (res.ok) return res.json();

  const mentah = await res.text().catch(() => "");
  let pesan = "";
  try {
    const isi = JSON.parse(mentah);
    pesan = Array.isArray(isi?.message) ? isi.message.join(", ") : isi?.message || "";
  } catch {
    /* badan respons bukan JSON */
  }

  if (!pesan) {
    if (res.status === 413) {
      pesan = "Ukuran berkas terlalu besar untuk diunggah. Perkecil gambar lalu coba lagi.";
    } else if (res.status === 502 || res.status === 503 || res.status === 504) {
      pesan = "Server tidak merespons saat memproses permintaan. Coba lagi beberapa saat.";
    } else if (res.status === 401 || res.status === 403) {
      pesan = "Sesi Anda sudah berakhir atau tidak punya izin. Silakan masuk kembali.";
    } else {
      pesan = `Permintaan gagal (HTTP ${res.status}).`;
    }
  }

  throw new Error(pesan);
}

// ── SEJARAH & IDENTITAS ──────────────────────────────────────
async function getSejarahIdentitas() {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas`, { method: "GET" });
  return handle(res);
}
async function postSejarahIdentitas(tahun_berdiri, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tahun_berdiri, deskripsi }),
  });
  return handle(res);
}
async function putSejarahIdentitas(id, tahun_berdiri, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tahun_berdiri, deskripsi }),
  });
  return handle(res);
}
async function deleteSejarahIdentitas(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/sejarah-identitas/${id}`, { method: "DELETE" });
  return handle(res);
}

// ── VISI & MISI ──────────────────────────────────────────────
async function getVisiMisi() {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi`, { method: "GET" });
  return handle(res); // [{ id, tipe: "visi"|"misi", deskripsi }]
}
async function postVisiMisi(tipe, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipe, deskripsi }),
  });
  return handle(res);
}
async function putVisiMisi(id, tipe, deskripsi) {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipe, deskripsi }),
  });
  return handle(res);
}
async function deleteVisiMisi(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/visi-misi/${id}`, { method: "DELETE" });
  return handle(res);
}

// ── STRUKTUR ORGANISASI (upload file: field "gambar") ────────
async function getStrukturOrganisasi() {
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi`, { method: "GET" });
  return handle(res);
}
async function postStrukturOrganisasi(gambarFile) {
  const fd = new FormData(); fd.append("gambar", gambarFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi`, { method: "POST", body: fd });
  return handle(res);
}
async function putStrukturOrganisasi(id, gambarFile) {
  const fd = new FormData(); fd.append("gambar", gambarFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi/${id}`, { method: "PUT", body: fd });
  return handle(res);
}
async function deleteStrukturOrganisasi(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/struktur-organisasi/${id}`, { method: "DELETE" });
  return handle(res);
}

// ── FASILITAS (upload file: field "foto") ────────────────────
async function getFasilitas() {
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas`, { method: "GET" });
  return handle(res);
}
async function postFasilitas(nama_fasilitas, deskripsi, fotoFile) {
  const fd = new FormData();
  fd.append("nama_fasilitas", nama_fasilitas);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (fotoFile) fd.append("foto", fotoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas`, { method: "POST", body: fd });
  return handle(res);
}
async function putFasilitas(id, nama_fasilitas, deskripsi, fotoFile) {
  const fd = new FormData();
  if (nama_fasilitas) fd.append("nama_fasilitas", nama_fasilitas);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (fotoFile) fd.append("foto", fotoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas/${id}`, { method: "PUT", body: fd });
  return handle(res);
}
async function deleteFasilitas(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/fasilitas/${id}`, { method: "DELETE" });
  return handle(res);
}

// ── PRESTASI (JSON) ──────────────────────────────────────────
// tingkat: "kabupaten"|"provinsi"|"nasional"|"internasional"
async function getPrestasi() {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi`, { method: "GET" });
  return handle(res);
}
async function postPrestasi(judul, tingkat, tahun, keterangan) {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ judul, tingkat, tahun, keterangan }),
  });
  return handle(res);
}
async function putPrestasi(id, judul, tingkat, tahun, keterangan) {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ judul, tingkat, tahun, keterangan }),
  });
  return handle(res);
}
async function deletePrestasi(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/prestasi/${id}`, { method: "DELETE" });
  return handle(res);
}

// ── PROGRAM KEAHLIAN (JSON, icon = string emoji/url) ─────────
async function getProgramKeahlian() {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian`, { method: "GET" });
  return handle(res);
}
async function postProgramKeahlian(nama_jurusan, deskripsi, icon) {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama_jurusan, deskripsi, icon }),
  });
  return handle(res);
}
async function putProgramKeahlian(id, nama_jurusan, deskripsi, icon) {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama_jurusan, deskripsi, icon }),
  });
  return handle(res);
}
async function deleteProgramKeahlian(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/program-keahlian/${id}`, { method: "DELETE" });
  return handle(res);
}

// ── MITRA KERJASAMA (upload file: field "logo") ──────────────
async function getMitraKerjasama() {
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama`, { method: "GET" });
  return handle(res);
}
async function postMitraKerjasama(nama_mitra, deskripsi, logoFile) {
  const fd = new FormData();
  fd.append("nama_mitra", nama_mitra);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (logoFile) fd.append("logo", logoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama`, { method: "POST", body: fd });
  return handle(res);
}
async function putMitraKerjasama(id, nama_mitra, deskripsi, logoFile) {
  const fd = new FormData();
  if (nama_mitra) fd.append("nama_mitra", nama_mitra);
  if (deskripsi) fd.append("deskripsi", deskripsi);
  if (logoFile) fd.append("logo", logoFile);
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama/${id}`, { method: "PUT", body: fd });
  return handle(res);
}
async function deleteMitraKerjasama(id) {
  const res = await apiHelper.fetchData(`${BASE_URL}/mitra-kerjasama/${id}`, { method: "DELETE" });
  return handle(res);
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
