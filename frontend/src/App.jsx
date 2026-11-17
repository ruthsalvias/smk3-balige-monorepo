// src/App.jsx — UPDATED (tambahkan route admin, halaman publik eager, admin lazy)
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages (yang sudah ada)
import BerandaPage from "./features/profil/pages/BerandaPage";
import BeritaPage from "./features/profil/pages/BeritaPage";
import BeritaDetailPage from "./features/profil/pages/BeritaDetailPage";
import ProfilPage from "./features/profil/pages/ProfilPage";
import PortofolioPage from "./features/profil/pages/PortofolioPage";
import PortofolioList from "./features/portofolio/pages/PortofolioList";
import PortofolioForm from "./features/portofolio/pages/PortofolioForm";
import PortofolioDetail from "./features/portofolio/pages/PortofolioDetail";
import ScrollToTop from "./components/ScrollToTop";

// Admin pages — dimuat terpisah agar pengunjung publik tidak mengunduh
// seluruh bundel admin (CSS admin ikut terpisah lewat import di bawah).
const AdminPelanggaranPage = lazy(() => import("./features/admin/pages/AdminPelanggaranPage"));
const AdminDashboardPage = lazy(() => import("./features/admin/pages/AdminDashboardPage"));
const AdminBeritaPage = lazy(() => import("./features/admin/pages/AdminBeritaPage").then((m) => ({ default: m.AdminBeritaPage })));
const AdminAgendaPage = lazy(() => import("./features/admin/pages/AdminBeritaPage").then((m) => ({ default: m.AdminAgendaPage })));
const AdminPengumumanPage = lazy(() => import("./features/admin/pages/AdminBeritaPage").then((m) => ({ default: m.AdminPengumumanPage })));
const AdminSejarahPage = lazy(() => import("./features/admin/pages/AdminSejarahPage").then((m) => ({ default: m.AdminSejarahPage })));
const AdminVisiMisiPage = lazy(() => import("./features/admin/pages/AdminVisiMisiStrukturProgramPage").then((m) => ({ default: m.AdminVisiMisiPage })));
const AdminStrukturPage = lazy(() => import("./features/admin/pages/AdminVisiMisiStrukturProgramPage").then((m) => ({ default: m.AdminStrukturPage })));
const AdminProgramPage = lazy(() => import("./features/admin/pages/AdminVisiMisiStrukturProgramPage").then((m) => ({ default: m.AdminProgramPage })));
const AdminFasilitasPage = lazy(() => import("./features/admin/pages/AdminFasilitasPrestasiMitraPage").then((m) => ({ default: m.AdminFasilitasPage })));
const AdminPrestasiPage = lazy(() => import("./features/admin/pages/AdminFasilitasPrestasiMitraPage").then((m) => ({ default: m.AdminPrestasiPage })));
const AdminMitraPage = lazy(() => import("./features/admin/pages/AdminFasilitasPrestasiMitraPage").then((m) => ({ default: m.AdminMitraPage })));
const AdminPengaturanPage = lazy(() => import("./features/admin/pages/AdminPengaturanPage"));
const AdminStatistikPage = lazy(() => import("./features/admin/pages/AdminStatistikPage"));
const AdminAkunPage = lazy(() => import("./features/admin/pages/AdminAkunPage"));
const AdminSklPage = lazy(() => import("./features/admin/pages/AdminSklPage"));

//manajemen data
const DataSiswaPage = lazy(() => import("./features/manajemen-data/pages/DataSiswaPage"));
const AddSiswaPage = lazy(() => import("./features/manajemen-data/pages/AddSiswaPage"));
const EditSiswaPage = lazy(() => import("./features/manajemen-data/pages/EditSiswaPage"));
const DetailSiswaPage = lazy(() => import("./features/manajemen-data/pages/DetailSiswaPage"));
const DataGuruPage = lazy(() => import("./features/manajemen-data/pages/DataGuruPage"));
const AddGuruPage = lazy(() => import("./features/manajemen-data/pages/AddGuruPage"));
const EditGuruPage = lazy(() => import("./features/manajemen-data/pages/EditGuruPage"));

import { ADMIN_PATH } from "./config/adminPath";

// akun & dokumen (siswa + guru)
import AkunSayaPage from "./features/akun/pages/AkunSayaPage";
import GuruDokumenPage from "./features/akun/pages/GuruDokumenPage";
import MasukPage from "./features/akun/pages/MasukPage";
import "./features/akun/resources/akun.css";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<BerandaPage />} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/berita/:tipe/:id" element={<BeritaDetailPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/portofolio" element={<PortofolioPage />} />
          <Route path="/portofolio/kelola" element={<PortofolioList />} />
          <Route path="/portofolio/tambah" element={<PortofolioForm />} />
          <Route path="/portofolio/edit/:id" element={<PortofolioForm />} />
          <Route path="/portofolio/:id" element={<PortofolioDetail />} />
          <Route path="/akun-saya" element={<AkunSayaPage />} />
          <Route path="/guru/dokumen" element={<GuruDokumenPage />} />
          <Route path="/masuk" element={<MasukPage />} />

          {/* ── Admin (URL rahasia, tidak ditautkan dari halaman publik) ── */}
          <Route path={ADMIN_PATH} element={<AdminDashboardPage />} />
          <Route path={`${ADMIN_PATH}/berita`} element={<AdminBeritaPage />} />
          <Route path={`${ADMIN_PATH}/agenda`} element={<AdminAgendaPage />} />
          <Route path={`${ADMIN_PATH}/pengumuman`} element={<AdminPengumumanPage />} />
          <Route path={`${ADMIN_PATH}/sejarah`} element={<AdminSejarahPage />} />
          <Route path={`${ADMIN_PATH}/visi-misi`} element={<AdminVisiMisiPage />} />
          <Route path={`${ADMIN_PATH}/struktur`} element={<AdminStrukturPage />} />
          <Route path={`${ADMIN_PATH}/program`} element={<AdminProgramPage />} />
          <Route path={`${ADMIN_PATH}/fasilitas`} element={<AdminFasilitasPage />} />
          <Route path={`${ADMIN_PATH}/prestasi`} element={<AdminPrestasiPage />} />
          <Route path={`${ADMIN_PATH}/mitra`} element={<AdminMitraPage />} />
          <Route path={`${ADMIN_PATH}/pengaturan`} element={<AdminPengaturanPage />} />
          <Route path={`${ADMIN_PATH}/statistik`} element={<AdminStatistikPage />} />
          <Route path={`${ADMIN_PATH}/pelanggaran`} element={<AdminPelanggaranPage />} />
          <Route path={`${ADMIN_PATH}/akun`} element={<AdminAkunPage />} />
          <Route path={`${ADMIN_PATH}/skl`} element={<AdminSklPage />} />

          {/*Manajemen Data*/}
          <Route path={`${ADMIN_PATH}/data/siswa`} element={<DataSiswaPage />} />
          <Route path={`${ADMIN_PATH}/data/siswa/add`} element={<AddSiswaPage />} />
          <Route path={`${ADMIN_PATH}/data/siswa/edit/:id`} element={<EditSiswaPage />} />
          <Route path={`${ADMIN_PATH}/data/siswa/:id`} element={<DetailSiswaPage />} />

          <Route path={`${ADMIN_PATH}/data/guru`} element={<DataGuruPage />} />
          <Route path={`${ADMIN_PATH}/data/guru/add`} element={<AddGuruPage />} />
          <Route path={`${ADMIN_PATH}/data/guru/edit/:id`} element={<EditGuruPage />} />

          {/* URL tidak dikenal (termasuk /admin lama) diarahkan ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
export default App;