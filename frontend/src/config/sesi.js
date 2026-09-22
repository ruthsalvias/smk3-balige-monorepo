import GATEWAY_URL from "./gateway";

const KUNCI_TOKEN = "token";
const KUNCI_USER = "user";

/** Dibaca juga oleh helpers lama lewat localStorage "token". */
export function ambilToken() {
  return localStorage.getItem(KUNCI_TOKEN) || "";
}

export function ambilUser() {
  try {
    const mentah = localStorage.getItem(KUNCI_USER);
    return mentah ? JSON.parse(mentah) : null;
  } catch {
    return null;
  }
}

export function simpanSesi(token, user) {
  localStorage.setItem(KUNCI_TOKEN, token);
  localStorage.setItem(KUNCI_USER, JSON.stringify(user));
  localStorage.setItem("userId", user?.id || "");
  localStorage.setItem("username", user?.username || "");
  localStorage.setItem("roles", (user?.roles || []).join(","));
}

export function hapusSesi() {
  [KUNCI_TOKEN, KUNCI_USER, "userId", "username", "roles", "accessToken"].forEach((k) =>
    localStorage.removeItem(k),
  );
}

/** Token kedaluwarsa dicek di sisi klien supaya tidak menembak API dengan token mati. */
export function tokenMasihBerlaku(token = ambilToken()) {
  if (!token) return false;
  try {
    const isi = JSON.parse(atob(token.split(".")[1]));
    return typeof isi.exp === "number" && isi.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function mintaToken(username, password) {
  const res = await fetch(`${GATEWAY_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const isi = await res.json().catch(() => ({}));
  if (!res.ok) {
    const pesan = Array.isArray(isi?.message) ? isi.message[0] : isi?.message;
    throw new Error(pesan || "Username atau password salah");
  }
  return isi.data;
}
