// src/features/admin/layouts/AdminLayout.jsx
import { NavLink, Navigate, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { useAuth } from "../../auth/context/AuthContext";
import Icon from "../../../components/Icon";
import { useSiteSettings } from "../../profil/context/SiteSettingsContext";
import { adminPath } from "../../../config/adminPath";

const NAV_SCROLL_KEY = "smk-admin-nav-scroll";

const navGroups = [
  {
    label: "Ringkasan",
    items: [{ to: adminPath(), icon: "dashboard", label: "Dashboard", end: true }],
  },
  {
    label: "Publikasi",
    items: [
      { to: adminPath("/berita"), icon: "news", label: "Berita" },
      { to: adminPath("/pengumuman"), icon: "megaphone", label: "Pengumuman" },
      { to: adminPath("/agenda"), icon: "calendar", label: "Agenda" },
    ],
  },
  {
    label: "Profil Sekolah",
    items: [
      { to: adminPath("/sejarah"), icon: "scroll", label: "Sejarah & Identitas" },
      { to: adminPath("/visi-misi"), icon: "target", label: "Visi & Misi" },
      { to: adminPath("/struktur"), icon: "sitemap", label: "Struktur Organisasi" },
      { to: adminPath("/program"), icon: "graduation", label: "Program Keahlian" },
      { to: adminPath("/fasilitas"), icon: "building", label: "Fasilitas" },
      { to: adminPath("/prestasi"), icon: "trophy", label: "Prestasi" },
      { to: adminPath("/mitra"), icon: "handshake", label: "Mitra Kerjasama" },
    ],
  },
  {
    label: "Kesiswaan",
    items: [
      { to: adminPath("/pelanggaran"), icon: "warning", label: "Pelanggaran" },
      { to: adminPath("/data/siswa"), icon: "students", label: "Data Siswa" },
      { to: adminPath("/data/guru"), icon: "teacher", label: "Data Guru" },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { to: adminPath("/pengaturan"), icon: "settings", label: "Pengaturan Sekolah" },
      { to: adminPath("/statistik"), icon: "chart", label: "Statistik Sekolah" },
    ],
  },
  {
    label: "Master Admin",
    masterAdmin: true,
    items: [{ to: adminPath("/akun"), icon: "shield", label: "Kelola Akun" }],
  },
];

export default function AdminLayout({
  children,
  title = "Admin Panel",
  subtitle,
  butuhMasterAdmin = false,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("smk-admin-sidebar") === "collapsed"
  );
  const navRef = useRef(null);
  const location = useLocation();
  const { isAuth, user, login, logout } = useAuth();
  const { pengaturan } = useSiteSettings();

  const simpanScrollNav = () => {
    if (navRef.current) {
      sessionStorage.setItem(NAV_SCROLL_KEY, String(navRef.current.scrollTop));
    }
  };

  // Tutup drawer otomatis setiap pindah halaman (mode mobile)
  useEffect(() => setSidebarOpen(false), [location.pathname]);

  // AdminLayout di-mount ulang tiap halaman — pulihkan posisi scroll menu.
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const tersimpan = Number(sessionStorage.getItem(NAV_SCROLL_KEY) || 0);
    el.scrollTop = Number.isFinite(tersimpan) ? tersimpan : 0;
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("smk-admin-sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  // Layar kecil memakai drawer, layar lebar melipat sidebar jadi ikon saja.
  const toggleSidebar = () => {
    if (window.matchMedia("(max-width: 900px)").matches) setSidebarOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  const displayName = user?.name || user?.username || "Administrator";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";
  const isMasterAdmin = Boolean(user?.roles?.includes("master_admin"));
  const roleLabel = isMasterAdmin
    ? "Master Admin"
    : user?.roles?.includes("admin")
      ? "Administrator"
      : user?.roles?.[0] || "Pengguna";

  const menuTampil = navGroups.filter((g) => !g.masterAdmin || isMasterAdmin);

  const handleLogout = async () => {
    const result = await showConfirmDialog("Keluar dari panel admin sekarang?");
    if (result.isConfirmed) logout();
  };

  // Gerbang akses: satu pintu masuk untuk semua peran, siswa dialihkan ke
  // halaman kelola portofolio miliknya.
  if (!isAuth || !user?.roles?.includes("admin")) {
    const isSiswa = user?.roles?.includes("siswa");
    if (isAuth && isSiswa) return <Navigate to="/portofolio/kelola" replace />;
    if (isAuth && user?.roles?.includes("guru")) return <Navigate to="/guru/dokumen" replace />;

    return (
      <div className="smk-admin-gate">
        <div className="smk-admin-gate-box">
          <span className="smk-admin-gate-logo">
            <Icon name="shield" size={30} />
          </span>
          <h1>Masuk ke Sistem</h1>
          <p>
            {isAuth
              ? "Akun Anda tidak memiliki akses ke panel administrasi maupun portofolio siswa."
              : "Halaman ini khusus pengelola website dan siswa. Silakan masuk untuk melanjutkan."}
          </p>
          {isAuth ? (
            <button className="smk-btn-primary" onClick={logout}>
              Keluar
            </button>
          ) : (
            <button className="smk-btn-primary" onClick={login}>
              Masuk
            </button>
          )}
        </div>
      </div>
    );
  }

  if (butuhMasterAdmin && !isMasterAdmin) {
    return <Navigate to={adminPath()} replace />;
  }

  return (
    <div className={`smk-admin-layout${collapsed ? " sidebar-collapsed" : ""}`}>
      {/* OVERLAY mobile */}
      {sidebarOpen && (
        <div
          className="smk-admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`smk-admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="smk-admin-brand">
          <span className="smk-admin-brand-logo">
            {(pengaturan.nama_singkat || "S3")
              .split(/\s+/)
              .map((w) => w.charAt(0))
              .join("")
              .slice(0, 3)
              .toUpperCase()}
          </span>
          <span className="smk-admin-brand-text">
            <strong>{pengaturan.nama_sekolah}</strong>
            <span>Panel Administrasi</span>
          </span>
        </div>

        <nav
          ref={navRef}
          className="smk-admin-nav"
          onScroll={simpanScrollNav}
        >
          {menuTampil.map((group) => (
            <div className="smk-admin-nav-group" key={group.label}>
              <span className="smk-admin-nav-label">{group.label}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  onClick={simpanScrollNav}
                  className={({ isActive }) =>
                    `smk-admin-nav-item${isActive ? " active" : ""}`
                  }
                >
                  <span className="smk-admin-nav-icon">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="smk-admin-nav-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="smk-admin-sidebar-footer">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            title="Buka Website"
            className="smk-admin-nav-item"
          >
            <span className="smk-admin-nav-icon">
              <Icon name="externalLink" size={18} />
            </span>
            <span className="smk-admin-nav-text">Buka Website</span>
          </a>
          <button
            className="smk-admin-nav-item smk-admin-logout"
            onClick={handleLogout}
            title="Keluar"
          >
            <span className="smk-admin-nav-icon">
              <Icon name="power" size={18} />
            </span>
            <span className="smk-admin-nav-text">Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="smk-admin-main">
        {/* TOPBAR */}
        <header className="smk-admin-topbar">
          <button
            className="smk-admin-burger"
            onClick={toggleSidebar}
            title={collapsed ? "Tampilkan menu" : "Sembunyikan menu"}
            aria-label={collapsed ? "Tampilkan menu" : "Sembunyikan menu"}
          >
            <Icon name={sidebarOpen ? "close" : "menu"} size={22} />
          </button>

          <div className="smk-admin-topbar-heading">
            <span className="smk-admin-breadcrumb">Admin · {title}</span>
            <h1 className="smk-admin-topbar-title">{title}</h1>
          </div>

          <div className="smk-admin-topbar-right">
            <div className="smk-admin-user">
              <span className="smk-admin-avatar">{initial}</span>
              <span className="smk-admin-user-meta">
                <strong>{displayName}</strong>
                <span>{roleLabel}</span>
              </span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="smk-admin-content">
          {subtitle && <p className="smk-admin-page-lead">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
