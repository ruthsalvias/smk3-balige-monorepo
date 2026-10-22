import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/context/AuthContext';
import { fetchOnePortofolio, submitPortofolio, publishPortofolio, rejectPortofolio } from '../states/action';
import { getPortofolioImageUrl } from '../api/portofolioApi';
import Navbar from '../../profil/components/NavbarComponent';
import Footer from '../../profil/components/FooterComponent';
import Icon from '../../../components/Icon';

const avatarColors = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#0e7490','#065f46'];
const getColor = (name) => { if (!name) return '#6b7280'; return avatarColors[name.charCodeAt(0) % avatarColors.length]; };
const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

// Badge status
const StatusBadge = ({ status }) => {
  const map = {
    draft:          { label: 'Draft',           bg: '#f3f4f6', color: '#374151' },
    pending_review: { label: 'Menunggu Review', bg: '#fef9c3', color: '#854d0e' },
    published:      { label: 'Published',       bg: '#dcfce7', color: '#166534' },
    rejected:       { label: 'Ditolak',         bg: '#fee2e2', color: '#991b1b' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      backgroundColor: s.bg, color: s.color,
      padding: '3px 12px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '600', fontFamily: 'Poppins, sans-serif',
    }}>
      {s.label}
    </span>
  );
};

function PortofolioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth, user, roles } = useAuth();

  const { detail: portfolio, loadingDetail: loading, loadingMutate, error } = useSelector((state) => state.portofolio);

  const namaUser = user?.name || user?.username || '';
  const isOwner = portfolio && isAuth && (
    portfolio.ownerUsername === user?.username ||
    portfolio.studentName === namaUser ||
    portfolio.ownerUsername === namaUser
  );
  const isAdmin = roles.includes('admin');
  const isSiswa = roles.includes('siswa');

  // State untuk modal reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    dispatch(fetchOnePortofolio(Number(id)));
  }, [dispatch, id]);

  const handleSubmit = async () => {
    if (!window.confirm('Ajukan portofolio ini untuk direview admin?')) return;
    const res = await dispatch(submitPortofolio(portfolio.id));
    if (res.success) setActionMsg('OK|Portofolio berhasil diajukan untuk review!');
    else setActionMsg('ERR|Gagal mengajukan: ' + res.message);
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish portofolio ini? Akan terlihat oleh publik.')) return;
    const res = await dispatch(publishPortofolio(portfolio.id));
    if (res.success) setActionMsg('OK|Portofolio berhasil dipublish!');
    else setActionMsg('ERR|Gagal publish: ' + res.message);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Alasan penolakan wajib diisi!'); return; }
    const res = await dispatch(rejectPortofolio(portfolio.id, rejectReason));
    if (res.success) {
      setActionMsg('OK|Portofolio berhasil ditolak.');
      setShowRejectModal(false);
      setRejectReason('');
    } else {
      setActionMsg('ERR|Gagal menolak: ' + res.message);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#faf9f0', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '40px 52px' }}><SkeletonDetail /></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div style={{ backgroundColor: '#faf9f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 40px', color: '#6b7280', flex: 1 }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Icon name="search" size={48} /></div>
          <h2 style={{ color: '#1a1a2e', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>Portofolio tidak ditemukan</h2>
          <button onClick={() => navigate('/portofolio')} style={{ backgroundColor: '#1f2c5c', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>
            Kembali ke Daftar
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
          <span className="smk-badge">Detail Karya</span>
          <h1 className="smk-subpage-title">{portfolio.title}</h1>
          <p className="smk-subpage-subtitle">
            Karya milik {portfolio.studentName} · {portfolio.major || 'SMK Negeri 3 Balige'}
          </p>
        </div>
      </section>

      <div className="smk-portofolio-page-container">

        {/* Pesan aksi */}
        {actionMsg && (
          <div style={{
            backgroundColor: actionMsg.startsWith('OK|') ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${actionMsg.startsWith('OK|') ? '#bbf7d0' : '#fca5a5'}`,
            color: actionMsg.startsWith('OK|') ? '#166534' : '#991b1b',
            padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
            fontSize: '14px', fontFamily: 'Poppins, sans-serif',
          }}>
            {actionMsg.replace(/^(OK|ERR)\|/, '')}
          </div>
        )}

        {/* Tombol aksi */}
        <div className="smk-portofolio-detail-header">
          <StatusBadge status={portfolio.status} />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Tombol siswa: Edit & Submit */}
            {isOwner && isSiswa && (
              <>
                <button onClick={() => navigate(`/portofolio/edit/${portfolio.id}`)}
                  style={btnStyle('#1f2c5c')}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1f2c5c')}
                >
                  <Icon name="edit" size={15} /> Edit
                </button>
                {(portfolio.status === 'draft' || portfolio.status === 'rejected') && (
                  <button onClick={handleSubmit} disabled={loadingMutate}
                    style={btnStyle('#d97706')}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b45309')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d97706')}
                  >
                    <Icon name="upload" size={15} /> Ajukan Review
                  </button>
                )}
              </>
            )}

            {/* Tombol admin: Publish & Reject */}
            {isAdmin && portfolio.status === 'pending_review' && (
              <>
                <button onClick={handlePublish} disabled={loadingMutate}
                  style={btnStyle('#059669')}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                >
                  <Icon name="shield" size={15} /> Publish
                </button>
                <button onClick={() => setShowRejectModal(true)} disabled={loadingMutate}
                  style={btnStyle('#dc2626')}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                >
                  <Icon name="close" size={15} /> Tolak
                </button>
              </>
            )}
          </div>
        </div>

        {/* Konten detail */}
        <div className="smk-portofolio-detail-grid">
          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {portfolio.image ? (
                <img src={getPortofolioImageUrl(portfolio.image)} alt={portfolio.title} style={{ maxWidth: '100%', maxHeight: '360px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#d1d5db' }}>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Icon name="image" size={44} /></div>
                  <p style={{ margin: 0, fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>Belum ada gambar proyek</p>
                </div>
              )}
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', fontFamily: 'Poppins, sans-serif' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2c5c', marginBottom: '16px', marginTop: 0 }}>Detail Proyek</h3>
              {[
                { label: 'Judul', value: portfolio.title },
                { label: 'Deskripsi', value: portfolio.description },
                { label: 'Jurusan', value: portfolio.major },
                { label: 'Kategori', value: portfolio.category },
                { label: 'Skill', value: portfolio.skill },
                { label: 'Status', value: <StatusBadge status={portfolio.status} /> },
                ...(portfolio.status === 'rejected' && portfolio.rejectionReason
                  ? [{ label: 'Alasan Tolak', value: <span style={{ color: '#dc2626' }}>{portfolio.rejectionReason}</span> }]
                  : []),
              ].map(({ label, value }, idx, arr) => (
                <div key={label} style={{ display: 'flex', gap: '20px', padding: '14px 0', borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ color: '#6b7280', fontWeight: '600', fontSize: '13px', minWidth: '88px' }}>{label}</span>
                  <span style={{ color: '#1a1a2e', fontSize: '14px', lineHeight: '1.6' }}>{value || '-'}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', textAlign: 'center', position: 'sticky', top: '90px', fontFamily: 'Poppins, sans-serif' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: getColor(portfolio.studentName), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', margin: '0 auto 12px' }}>
                {getInitial(portfolio.studentName)}
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>{portfolio.studentName}</p>
              <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#6b7280' }}>{portfolio.major || 'Siswa SMK N3 Balige'}</p>
              {isOwner && (
                <div style={{ marginBottom: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#1f2c5c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Icon name="shield" size={14} /> Ini adalah karya milikmu
                </div>
              )}
              <button onClick={() => navigate('/portofolio')} style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid #d1d5db', padding: '9px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151', fontFamily: 'Poppins, sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Reject */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '480px', fontFamily: 'Poppins, sans-serif' }}>
            <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Tolak Portofolio</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>Berikan alasan penolakan yang jelas agar siswa dapat memperbaiki karyanya.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Gambar kurang jelas, deskripsi terlalu singkat..."
              rows={4}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                style={{ backgroundColor: 'transparent', border: '1px solid #d1d5db', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                Batal
              </button>
              <button onClick={handleReject} disabled={loadingMutate}
                style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                {loadingMutate ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const btnStyle = (bg) => ({
  backgroundColor: bg, color: 'white', border: 'none',
  padding: '9px 18px', borderRadius: '8px', cursor: 'pointer',
  fontSize: '13px', fontWeight: '600', fontFamily: 'Poppins, sans-serif',
  transition: 'background 0.15s',
});

// SkeletonDetail sama seperti sebelumnya
function SkeletonDetail() {
  const bar = (w, h = 14) => (<div style={{ width: w, height: h, borderRadius: '6px', backgroundColor: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />);
  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginTop: '16px' }}>
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{bar('80%', 200)}</div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px' }}>
            {[1,2,3,4,5].map((i) => (<div key={i} style={{ display: 'flex', gap: '20px', padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>{bar('80px')} {bar('60%')}</div>))}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} /></div>
          {[1,2,3].map((i) => <div key={i} style={{ marginBottom: '12px' }}>{bar('100%')}</div>)}
        </div>
      </div>
    </>
  );
}

export default PortofolioDetail;