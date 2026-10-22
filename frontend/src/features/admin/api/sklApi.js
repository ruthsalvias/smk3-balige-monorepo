import apiHelper, { BASE_URL, getAccessToken } from "../../../helpers/apiHelperManajemen";

const SKL_API = `${BASE_URL}/skl`;

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Mengambil isi direktori folder tertentu atau root
 */
export async function getExplorer(folderId = null) {
  const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
  const res = await apiHelper.fetchData(`${SKL_API}/explorer${query}`);
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal membuka folder penyimpanan");
  }
  return res.json();
}

/**
 * Mencari file atau folder
 */
export async function searchSkl(q, tahunLulus = "") {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tahunLulus) params.set("tahunLulus", tahunLulus);

  const res = await apiHelper.fetchData(`${SKL_API}/search?${params.toString()}`);
  if (!res.ok) throw new Error("Pencarian gagal");
  return res.json();
}

/**
 * Statistik penyimpanan SKL
 */
export async function getSklStats() {
  const res = await apiHelper.fetchData(`${SKL_API}/stats`);
  if (!res.ok) throw new Error("Gagal memuat statistik");
  return res.json();
}

/**
 * Buat folder baru
 */
export async function createFolder({ nama, parentId = null, warna = "blue" }) {
  const res = await apiHelper.fetchData(`${SKL_API}/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, parentId, warna }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal membuat folder");
  }
  return res.json();
}

/**
 * Edit folder
 */
export async function updateFolder(id, { nama, warna }) {
  const res = await apiHelper.fetchData(`${SKL_API}/folders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, warna }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal memperbarui folder");
  }
  return res.json();
}

/**
 * Hapus folder
 */
export async function deleteFolder(id) {
  const res = await apiHelper.fetchData(`${SKL_API}/folders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal menghapus folder");
  }
  return res.json();
}

/**
 * Upload multiple files ke dalam folder
 */
export async function uploadFiles(files, { folderId = null, tahunLulus = "", keterangan = "" }) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  if (folderId && folderId !== "root") {
    formData.append("folderId", folderId);
  }
  if (tahunLulus) {
    formData.append("tahunLulus", tahunLulus);
  }
  if (keterangan) {
    formData.append("keterangan", keterangan);
  }

  const token = getAccessToken();
  const res = await fetch(`${SKL_API}/files/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal mengunggah file");
  }
  return res.json();
}

/**
 * Edit file
 */
export async function updateFile(id, { namaFile, tahunLulus, keterangan }) {
  const res = await apiHelper.fetchData(`${SKL_API}/files/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namaFile, tahunLulus, keterangan }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal memperbarui file");
  }
  return res.json();
}

/**
 * Hapus file
 */
export async function deleteFile(id) {
  const res = await apiHelper.fetchData(`${SKL_API}/files/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal menghapus file");
  }
  return res.json();
}

/**
 * Download file dengan nama aslinya
 */
export async function downloadFile(fileId, filename) {
  const res = await apiHelper.fetchData(`${SKL_API}/files/${fileId}/download`);
  if (!res.ok) throw new Error("Gagal mengunduh file");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "dokumen_skl.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Ambil preview blob untuk ditampilkan inline
 */
export async function getPreviewBlobUrl(fileId) {
  const res = await apiHelper.fetchData(`${SKL_API}/files/${fileId}/preview`);
  if (!res.ok) throw new Error("Gagal membuka pratinjau file");
  const blob = await res.blob();
  return window.URL.createObjectURL(blob);
}
