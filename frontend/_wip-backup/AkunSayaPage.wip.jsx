import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from '@iconify/react';
import { BASE_URL } from '@env';
import './AkunSayaPage.css';

// Assuming these paths and actions are correct
import {
  fetchDokumenSaya,
  setProfile,
  updateProfil,
  updatePassword,
  fetchPortofolioSaya,
  tambahPortofolio,
  ubahPortofolio,
  hapusPortofolio,
  setEditingPortofolio,
} from '@features/akun';

import ProfileForm from '@components/ProfileForm';
import PasswordForm from '@components/PasswordForm';
import PortfolioForm from '@components/PortfolioForm';

const AkunSayaPage = () => {
  const dispatch = useDispatch();
  const { user, profile, pengguna, siswa, loading, error, portofolio, editingPortofolio } = useSelector((state) => state.akun);

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);

  useEffect(() => {
    dispatch(fetchDokumenSaya());
    dispatch(fetchPortofolioSaya());
  }, [dispatch]);

  // New effect to ensure portfolio management is shown if user is a student
  useEffect(() => {
    if (user && user.roles && user.roles.includes('siswa') && !showPortfolioForm) {
      // If user is a student and portfolio form is not already open,
      // navigate or set state to show the management view.
      // For simplicity, we'll assume showing the form directly is the desired behavior.
      // If a dedicated 'kelola' page existed and needed navigation, we'd use React Router or similar.
      // For now, we'll explicitly show the portfolio management part.
      // If 'portofolio' data has been fetched and is empty, still show the 'Add Portfolio' button.
      if (portofolio !== null) { // Check if portofolio data has been loaded
         setShowPortfolioForm(true); // Directly show the form/management view first
      }
    }
  }, [user, portofolio, showPortfolioForm]); // Depend on user, portofolio data, and form visibility

  const handleUpdateProfile = (data) => {
    dispatch(updateProfil(data));
  };

  const handleUpdatePassword = (data) => {
    dispatch(updatePassword(data));
  };

  const handleTambahPortofolio = (data) => {
    dispatch(tambahPortofolio(data));
    handleClosePortfolioForm();
  };

  const handleUbahPortofolio = (data) => {
    dispatch(ubahPortofolio(data));
    handleClosePortfolioForm();
  };

  const handleHapusPortofolio = (id) => {
    dispatch(hapusPortofolio(id));
  };

  const handleOpenPortfolioForm = (portfolioToEdit = null) => {
    dispatch(setEditingPortofolio(portfolioToEdit ? portfolioToEdit.id : null));
    setShowPortfolioForm(true);
  };

  const handleClosePortfolioForm = () => {
    setShowPortfolioForm(false);
    dispatch(setEditingPortofolio(null));
  };

  return (
    <div className="akun-saya-page">
      <h1>Akun Saya</h1>

      {/* Profile Section */}
      <div className="akun-saya-section">
        <h2>Profil Pengguna</h2>
        {profile ? (
          <div>
            <p><strong>Nama:</strong> {profile.namaLengkap || (siswa && siswa.namaLengkap) || 'N/A'}</p>
            <p><strong>NIS:</strong> {profile.nis || (siswa && siswa.nis) || 'N/A'}</p>
            <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
            <button onClick={() => setShowProfileForm(true)} className="smk-btn-secondary">Ubah Profil</button>
          </div>
        ) : (
          loading ? <p>Memuat profil...</p> : <p>Data profil tidak ditemukan.</p>
        )}
        {showProfileForm && (
          <ProfileForm
            initialData={profile}
            onSubmit={handleUpdateProfile}
            onCancel={() => setShowProfileForm(false)}
          />
        )}
      </div>

      {/* Password Section */}
      <div className="akun-saya-section">
        <h2>Ubah Kata Sandi</h2>
        <button onClick={() => setShowPasswordForm(true)} className="smk-btn-secondary">Ubah Kata Sandi</button>
        {showPasswordForm && (
          <PasswordForm
            onSubmit={handleUpdatePassword}
            onCancel={() => setShowPasswordForm(false)}
          />
        )}
      </div>

      {/* Dokumen Saya Section */}
      <div className="akun-saya-section">
        <h2>Dokumen Saya</h2>
        {pengguna?.dokumen && pengguna.dokumen.length > 0 ? (
          <ul>
            {pengguna.dokumen.map((doc) => (
              <li key={doc.id}>
                {doc.nama_dokumen} - {doc.status}
              </li>
            ))}
          </ul>
        ) : (
          loading ? <p>Memuat dokumen...</p> : <p>{siswa ? 'Data siswa belum ditemukan.' : 'Anda belum memiliki dokumen.'}</p>
        )}
      </div>

      {/* Portofolio Section */}
      <div className="akun-saya-section">
        <h2>Galeri Portofolio</h2>
        {loading ? (
          <p>Memuat portofolio...</p>
        ) : portofolio && portofolio.length > 0 ? (
          <>
            <div className="smk-portfolio-list">
              {portofolio.map((item) => (
                <div key={item.id} className="smk-portfolio-item">
                  <div className="smk-portfolio-item-image">
                    {item.image ? (
                      <img src={`${BASE_URL}/storage/${item.image}`} alt={item.title} />
                    ) : (
                      <Icon icon="mdi:image-off" width="48" />
                    )}
                  </div>
                  <div className="smk-portfolio-item-info">
                    <h3>{item.title}</h3>
                    <p>{item.description.substring(0, 100)}{item.description.length > 100 ? "..." : ""}</p>
                    <div className="smk-portfolio-item-meta">
                      <span>Jurusan: {item.major || 'N/A'}</span>
                      <span>Skill: {item.skill || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="smk-portfolio-item-actions">
                    <button onClick={() => handleOpenPortfolioForm(item)} className="smk-btn-secondary">
                      Ubah
                    </button>
                    <button onClick={() => handleHapusPortofolio(item.id)} className="smk-btn-danger">
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="smk-portfolio-add-container">
              <button onClick={() => handleOpenPortfolioForm()} className="smk-btn-primary">
                + Tambah Portofolio
              </button>
            </div>
          </>
        ) : (
          <p>Anda belum memiliki portofolio.</p>
        )}
        {showPortfolioForm && (
          <PortfolioForm
            portfolio={editingPortofolio ? portofolio.find(p => p.id === editingPortofolio) : null}
            onSubmit={editingPortofolio ? handleUbahPortofolio : handleTambahPortofolio}
            onCancel={handleClosePortfolioForm}
            BASE_URL={BASE_URL}
          />
        )}
      </div>
    </div>
  );
};

export default AkunSayaPage;
