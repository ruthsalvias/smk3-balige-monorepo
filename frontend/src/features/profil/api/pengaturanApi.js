import apiHelper, { BASE_URL } from "../../../helpers/apiHelper";

async function handle(res) {
  if (!res.ok) {
    let msg = "Terjadi kesalahan";
    try {
      const e = await res.json();
      msg = Array.isArray(e.message) ? e.message.join(", ") : e.message || msg;
    } catch {
      /* body bukan JSON */
    }
    throw new Error(msg);
  }
  return res.json();
}

// ── PENGATURAN SEKOLAH (singleton) ───────────────────────────
export async function getPengaturan() {
  return handle(await apiHelper.fetchData(`${BASE_URL}/pengaturan-sekolah`, { method: "GET" }));
}

/**
 * @param {object} payload field pengaturan
 * @param {File|null} logoFile file logo opsional
 * @param {File[]|null} heroFiles file hero images opsional (multiple)
 * @param {File|null} loginBgFile file login background opsional
 */
export async function putPengaturan(payload, logoFile, heroFiles, loginBgFile) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    form.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });
  if (logoFile) form.append("logo", logoFile);
  if (heroFiles && heroFiles.length > 0) {
    heroFiles.forEach((file) => form.append("hero_images", file));
  }
  if (loginBgFile) form.append("login_bg", loginBgFile);

  return handle(
    await apiHelper.fetchData(`${BASE_URL}/pengaturan-sekolah`, { method: "PUT", body: form })
  );
}

// ── STATISTIK SEKOLAH ────────────────────────────────────────
export async function getStatistik() {
  return handle(await apiHelper.fetchData(`${BASE_URL}/statistik`, { method: "GET" }));
}

export async function postStatistik(payload) {
  return handle(
    await apiHelper.fetchData(`${BASE_URL}/statistik`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function putStatistik(id, payload) {
  return handle(
    await apiHelper.fetchData(`${BASE_URL}/statistik/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function deleteStatistik(id) {
  return handle(await apiHelper.fetchData(`${BASE_URL}/statistik/${id}`, { method: "DELETE" }));
}

export default {
  getPengaturan,
  putPengaturan,
  getStatistik,
  postStatistik,
  putStatistik,
  deleteStatistik,
};
