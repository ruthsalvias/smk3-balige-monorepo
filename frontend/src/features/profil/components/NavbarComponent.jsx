import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { mediaUrl } from "../../admin/components/AdminComponents";
import Icon from "../../../components/Icon";
import { ADMIN_PATH } from "../../../config/adminPath";

const menu = (isSiswa) => [
  { to: "/", label: "Beranda", end: true },
  { to: "/berita", label: "Berita & Informasi" },
  { to: "/profil", label: "Profil Sekolah", sections: true },
  {
    to: isSiswa ? "/portofolio/kelola" : "/portofolio",
    label: "Portofolio",
  },
];

// Sesuai judul besar tiap bagian di halaman Profil Sekolah.
const profilSections = [
  { hash: "#sejarah", label: "Sejarah & Identitas" },
  { hash: "#visi-misi", label: "Visi & Misi" },
  { hash: "#struktur-organisasi", label: "Struktur Organisasi" },
  { hash: "#fasilitas", label: "Fasilitas & Sarana Belajar" },
  { hash: "#prestasi", label: "Akreditasi & Prestasi" },
  { hash: "#program-keahlian", label: "Program Keahlian" },
  { hash: "#mitra", label: "Mitra Kerjasama" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profilOpen, setProfilOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isAuth, user, logout } = useAuth();
  const { pengaturan } = useSiteSettings();
  const isAdmin = user?.roles?.includes("admin");
  const isGuru = user?.roles?.includes("guru");
  const isSiswa = user?.roles?.includes("siswa");
  const logoSrc = mediaUrl(pengaturan.logo_url);

  useEffect(() => {
    if (!profilOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfilOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profilOpen]);

  const goToSection = (hash) => {
    setProfilOpen(false);
    setOpen(false);
    navigate(`/profil${hash}`);
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="smk-navbar">
      <div className="smk-nav-inner">
        <NavLink to="/" className="smk-nav-logo">
          <span className="smk-logo-icon">
            {logoSrc ? (
              <img src={logoSrc} alt="" className="smk-logo-img" />
            ) : (
              <Icon name="graduation" size={22} />
            )}
          </span>
          <span className="smk-logo-text">
            <strong>{pengaturan.nama_sekolah}</strong>
            <span>{pengaturan.tagline}</span>
          </span>
        </NavLink>

        <nav className={`smk-nav-menu${open ? " open" : ""}`}>
          {menu(isSiswa).map((item) =>
            item.sections ? (
              <div
                key={item.to}
                className={`smk-nav-dropdown${profilOpen ? " open" : ""}`}
                ref={dropdownRef}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `smk-nav-item smk-nav-dropdown-toggle${isActive ? " smk-nav-active" : ""}`
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    setProfilOpen((prev) => !prev);
                  }}
                  aria-haspopup="true"
                  aria-expanded={profilOpen}
                >
                  {item.label}
                  <Icon name="chevronRight" size={13} />
                </NavLink>
                <div className="smk-nav-dropdown-menu" role="menu">
                  <button
                    type="button"
                    className="smk-nav-dropdown-item smk-nav-dropdown-all"
                    onClick={() => goToSection("#sejarah")}
                  >
                    Lihat Semua Profil
                  </button>
                  {profilSections.map((section) => (
                    <button
                      key={section.hash}
                      type="button"
                      className="smk-nav-dropdown-item"
                      onClick={() => goToSection(section.hash)}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `smk-nav-item${isActive ? " smk-nav-active" : ""}`}
              >
                {item.label}
              </NavLink>
            )
          )}
          {isAdmin && (
            <NavLink to={ADMIN_PATH} className="smk-nav-item" onClick={() => setOpen(false)}>
              Panel Admin
            </NavLink>
          )}
          {isGuru && (
            <NavLink to="/guru/dokumen" className="smk-nav-item" onClick={() => setOpen(false)}>
              Dokumen Siswa
            </NavLink>
          )}
          {(isSiswa || isGuru) && (
            <NavLink to="/akun-saya" className="smk-nav-item" onClick={() => setOpen(false)}>
              Akun Saya
            </NavLink>
          )}
        </nav>

        <div className="smk-nav-actions">
          {isAuth ? (
            <>
              <span className="smk-nav-user">{user?.name || user?.username}</span>
              <button className="smk-btn-login ghost" onClick={logout}>Keluar</button>
            </>
          ) : (
            <NavLink to="/masuk" className="smk-btn-login" onClick={() => setOpen(false)}>
              Masuk
            </NavLink>
          )}
          <button
            className="smk-nav-burger"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Menu"
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}