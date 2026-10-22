import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/context/AuthContext';
import { createPortofolio, updatePortofolio, fetchOnePortofolio } from '../states/action';
import { getPortofolioImageUrl } from '../api/portofolioApi';
import Navbar from '../../profil/components/NavbarComponent';
import Footer from '../../profil/components/FooterComponent';
import Icon from '../../../components/Icon';

const JURUSAN_OPTIONS = [
  { value: 'Tataboga', label: 'Tataboga' },
  { value: 'Perhotelan', label: 'Perhotelan' },
];

const CATEGORY_OPTIONS = [
  { value: 'Culinary Art', label: 'Culinary Art (Seni Kuliner)' },
  { value: 'Pastry & Bakery', label: 'Pastry & Bakery (Kue & Roti)' },
  { value: 'Hospitality Service', label: 'Hospitality Service (Pelayanan Hotel)' },
  { value: 'Housekeeping Management', label: 'Housekeeping Management' },
  { value: 'Food & Beverage Service', label: 'Food & Beverage Service' },
];

function PortofolioForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { isAuth, user, roles } = useAuth();
  const isSiswa = roles.includes('siswa');

  const { detail: portfolioToEdit, loadingDetail } = useSelector((state) => state.portofolio);

  // State Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    major: 'Tataboga',
    category: 'Culinary Art',
    skill: '',
  });

  const [imageFile, setImageFile] = useState(null); // Menyimpan file mentah (.jpg/.png)
  const [imagePreview, setImagePreview] = useState(''); // Menyimpan URL sementara untuk preview di layar
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Jika mode EDIT, ambil data dari backend
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchOnePortofolio(Number(id)));
    }
  }, [dispatch, id, isEditMode]);

  // 2. Set isi form saat data lama berhasil diambil (Mode Edit)
  useEffect(() => {
    if (isEditMode && portfolioToEdit) {
      setFormData({
        title: portfolioToEdit.title || '',
        description: portfolioToEdit.description || '',
        major: portfolioToEdit.major || 'Tataboga',
        category: portfolioToEdit.category || 'Culinary Art',
        skill: portfolioToEdit.skill || '',
      });
      // Jika di database sudah ada gambar sebelumnya, tampilkan sebagai preview
      if (portfolioToEdit.image) {
        setImagePreview(getPortofolioImageUrl(portfolioToEdit.image));
      }
    }
  }, [portfolioToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Menangani saat siswa memilih file dari komputer
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (misal maksimal 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Ukuran file terlalu besar! Maksimal adalah 2MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Buat URL lokal sementara untuk preview foto
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage('Judul dan Deskripsi proyek wajib diisi!');
      setSubmitting(false);
      return;
    }

    if (!isAuth || !isSiswa) {
      setErrorMessage('Hanya pengguna siswa yang dapat membuat atau memperbarui portofolio. Silakan login dengan akun siswa.');
      setSubmitting(false);
      return;
    }

    // KONVERSI KE FORMDATA (Wajib untuk upload file)
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('major', formData.major);
    dataToSend.append('category', formData.category);
    dataToSend.append('skill', formData.skill);
    
    // Pastikan nama siswa yang terkirim adalah nama lengkap, bukan username / NIS
    const namaSiswa = user?.nama || user?.name || user?.username || '';
    if (namaSiswa) {
      dataToSend.append('studentName', namaSiswa);
    }
    
    // Jika ada file baru yang dipilih, masukkan ke FormData
    if (imageFile) {
      dataToSend.append('image', imageFile);
    }

    let response;
    if (isEditMode) {
      response = await dispatch(updatePortofolio(Number(id), dataToSend));
    } else {
      response = await dispatch(createPortofolio(dataToSend));
    }

    setSubmitting(false);

    if (response?.success) {
      navigate('/portofolio/kelola');
    } else {
      setErrorMessage(response?.message || 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  if (isEditMode && loadingDetail) {
    return (
      <div style={{ backgroundColor: '#faf9f0', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px', color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
          <h3>Memuat data portofolio...</h3>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div style={{ backgroundColor: '#faf9f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 40px', color: '#6b7280', flex: 1, fontFamily: 'Poppins, sans-serif' }}>
          <h2 style={{ color: '#1a1a2e', marginBottom: '12px' }}>Login dibutuhkan</h2>
          <p style={{ marginBottom: '24px' }}>
            Silakan masuk dengan akun siswa untuk menambahkan atau mengedit portofolio.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1f2c5c', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Refresh setelah login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isSiswa) {
    return (
      <div style={{ backgroundColor: '#faf9f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 40px', color: '#6b7280', flex: 1, fontFamily: 'Poppins, sans-serif' }}>
          <h2 style={{ color: '#1a1a2e', marginBottom: '12px' }}>Akses ditolak</h2>
          <p style={{ marginBottom: '24px' }}>
            Hanya siswa yang dapat membuat dan mengelola portofolio. Gunakan akun siswa atau hubungi admin.
          </p>
          <button
            onClick={() => navigate('/portofolio/kelola')}
            style={{
              backgroundColor: '#1f2c5c', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Kembali ke daftar portofolio
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#faf9f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section className="smk-subpage-hero">
        <div className="smk-container smk-center">
          <span className="smk-badge">{isEditMode ? 'Mode Edit' : 'Mode Tambah'}</span>
          <h1 className="smk-subpage-title" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {isEditMode ? 'Edit Portofolio Karya' : 'Tambah Portofolio Baru'}
          </h1>
        </div>
      </section>

      <div style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          backgroundColor: 'white', width: '100%', maxWidth: '680px', 
          borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          fontFamily: 'Poppins, sans-serif'
        }}>
          
          {errorMessage && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c',
              padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Icon name="warning" size={16} /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Info Pemilik / Siswa */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '10px',
              backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: '#16a34a', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '15px', flexShrink: 0
              }}>
                {(user?.nama || user?.name || user?.username || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nama Siswa Pembuat Karya
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                  {user?.nama || user?.name || user?.username || 'Siswa'}
                </div>
                {user?.username && (
                  <div style={{ fontSize: '11px', color: '#16a34a' }}>
                    NIS: {user.username}
                  </div>
                )}
              </div>
            </div>

            {/* Input Judul */}
            <div>
              <label style={labelStyle}>Judul Proyek / Karya <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Contoh: Kue Tart Karakter Pernikahan" style={inputStyle} />
            </div>

            {/* Dropdown Jurusan & Kategori */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Jurusan</label>
                <select name="major" value={formData.major} onChange={handleChange} style={inputStyle}>
                  {JURUSAN_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Kategori Karya</label>
                <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                  {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            {/* Input Skill */}
            <div>
              <label style={labelStyle}>Skill / Keahlian yang Digunakan</label>
              <input type="text" name="skill" value={formData.skill} onChange={handleChange} placeholder="Contoh: Baking, Cake Decoration, Plating" style={inputStyle} />
            </div>

            {/* INPUT FILE UPLOAD GAMBAR */}
            <div>
              <label style={labelStyle}>Gambar Sampul Proyek</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', border: '2px dashed #d1d5db', padding: '20px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: '180px', borderRadius: '6px', objectFit: 'cover', marginBottom: '10px' }} />
                ) : (
                  <div style={{ color: '#9ca3af', display: 'flex' }}><Icon name="image" size={38} /></div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  style={{ backgroundColor: '#1f2c5c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  {imagePreview ? 'Ganti Gambar' : 'Pilih File Gambar'}
                </button>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>Format: JPG, PNG (Maks. 2MB)</span>
              </div>
            </div>

            {/* Input Deskripsi */}
            <div>
              <label style={labelStyle}>Deskripsi Singkat Proyek <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Jelaskan detail pembuatan karya, bahan, atau pelayanan hotel yang dikerjakan..." rows="4" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={() => navigate('/portofolio/kelola')} disabled={submitting} style={{ backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Batal</button>
              <button type="submit" disabled={submitting} style={{ backgroundColor: '#1f2c5c', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Publish Portofolio'}
              </button>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: '600', fontSize: '14px', color: '#1f2c5c', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', outline: 'none' };

export default PortofolioForm;