// src/App.jsx — UPDATED (tambahkan route admin)
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
import AdminPelanggaranPage from './features/admin/pages/AdminPelanggaranPage'; 

// Admin pages (baru)
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import ScrollToTop from "./components/ScrollToTop";
import { AdminBeritaPage, AdminAgendaPage, AdminPengumumanPage } from "./features/admin/pages/AdminBeritaPage";
import { AdminSejarahPage } from "./features/admin/pages/AdminSejarahPage";
import { AdminVisiMisiPage, AdminStrukturPage, AdminProgramPage } from "./features/admin/pages/AdminVisiMisiStrukturProgramPage";
import { AdminFasilitasPage, AdminPrestasiPage, AdminMitraPage } from "./features/admin/pages/AdminFasilitasPrestasiMitraPage";
import AdminPengaturanPage from "./features/admin/pages/AdminPengaturanPage";
import AdminStatistikPage from "./features/admin/pages/AdminStatistikPage";
import AdminAkunPage from "./features/admin/pages/AdminAkunPage";
import AdminSklPage from "./features/admin/pages/AdminSklPage";

//manajemen data
import DataSiswaPage from "./features/manajemen-data/pages/DataSiswaPage";
import AddSiswaPage from "./features/manajemen-data/pages/AddSiswaPage";
import EditSiswaPage from "./features/manajemen-data/pages/EditSiswaPage";
import DataGuruPage from "./features/manajemen-data/pages/DataGuruPage";
import AddGuruPage from "./features/manajemen-data/pages/AddGuruPage";
import EditGuruPage from "./features/manajemen-data/pages/EditGuruPage";

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
        <Route path={`${ADMIN_PATH}/data/siswa`} element={<DataSiswaPage/>} />
        <Route path={`${ADMIN_PATH}/data/siswa/add`} element={<AddSiswaPage/>} />
        <Route path={`${ADMIN_PATH}/data/siswa/edit/:id`} element={<EditSiswaPage/>} />

        <Route path={`${ADMIN_PATH}/data/guru`} element={<DataGuruPage/>} />
        <Route path={`${ADMIN_PATH}/data/guru/add`} element={<AddGuruPage/>} />
        <Route path={`${ADMIN_PATH}/data/guru/edit/:id`} element={<EditGuruPage/>} />

        {/* URL tidak dikenal (termasuk /admin lama) diarahkan ke beranda */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
