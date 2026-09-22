import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ADMIN_PATH } from "../../../config/adminPath";

function tujuanPeran(roles = []) {
  if (roles.includes("master_admin") || roles.includes("admin")) return ADMIN_PATH;
  if (roles.includes("guru")) return "/guru/dokumen";
  if (roles.includes("siswa")) return "/akun-saya";
  return "/";
}

// Satu pintu masuk untuk semua peran; tujuan ditentukan dari role akun.
export default function MasukPage() {
  const { isAuth, masuk, roles = [] } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [memproses, setMemproses] = useState(false);

  useEffect(() => {
    document.title = "Masuk · SMK Negeri 3 Balige";
  }, []);

  if (isAuth) return <Navigate to={tujuanPeran(roles)} replace />;

  const kirim = async (e) => {
    e.preventDefault();
    if (memproses) return;

    setPesan("");
    setMemproses(true);
    try {
      const akun = await masuk(username.trim(), password);
      navigate(tujuanPeran(akun.roles), { replace: true });
    } catch (err) {
      setPesan(err.message || "Gagal masuk. Coba lagi.");
      setMemproses(false);
    }
  };

  return (
    <div className="smk-masuk">
      <form className="smk-masuk-box" onSubmit={kirim}>
        <h1>Masuk ke Sistem</h1>
        <p>Gunakan akun yang diberikan sekolah. Siswa memakai NIS sebagai username.</p>

        <label className="smk-masuk-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="smk-masuk-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
        />

        <label className="smk-masuk-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="smk-masuk-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {pesan && (
          <div className="smk-masuk-pesan" role="alert">
            {pesan}
          </div>
        )}

        <button className="smk-btn-primary smk-masuk-tombol" type="submit" disabled={memproses}>
          {memproses ? "Memproses..." : "Masuk"}
        </button>

        <a className="smk-masuk-kembali" href="/">
          Kembali ke beranda
        </a>
      </form>
    </div>
  );
}
