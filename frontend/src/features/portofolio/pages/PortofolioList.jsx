import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/context/AuthContext';
import { fetchAllPortofolio, fetchMyPortofolios, deletePortofolio } from '../states/action';
import { getPortofolioImageUrl } from '../api/portofolioApi';
import ActionMenu from '../components/ActionMenu';
import Navbar from '../../profil/components/NavbarComponent';
import Footer from '../../profil/components/FooterComponent';
import Icon from '../../../components/Icon';

const JURUSAN_OPTIONS = ['Tataboga', 'Perhotelan'];

const avatarColors = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#0e7490', '#065f46',
];
const getColor = (name) => {
  if (!name) return '#6b7280';
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
};
const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const PER_PAGE = 10;

function PortofolioList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth, login, user, roles } = useAuth();
  const isSiswa = roles.includes('siswa');

  const { list, loading, error } = useSelector((state) => state.portofolio);

  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [page, setPage] = useState(1);
  const [showMine, setShowMine] = useState(false);

  const namaUser = user?.name || user?.username || '';

  useEffect(() => {
    const params = {
      search: search || undefined,
      major: filterJurusan || undefined,
      page,
      limit: PER_PAGE,
    };

    if (showMine && isSiswa) {
      dispatch(fetchMyPortofolios(params));
    } else {
      dispatch(fetchAllPortofolio(params));
    }
  }, [dispatch, search, filterJurusan, page, showMine, isSiswa, isAuth]);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus portofolio ini?')) return;
    const result = await dispatch(deletePortofolio(id));
    if (!result.success) alert('Gagal menghapus data.');
  };

  const totalPages = Math.max(1, Math.ceil((list || []).length / PER_PAGE));
  const paginated = (list || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const isOwner = (portfolio) => {
    if (!isAuth) return false;
    return (
      portfolio.ownerUsername === user?.username ||
      portfolio.studentName === namaUser ||
      portfolio.ownerUsername === namaUser
    );
  };

  return (
    <div style={{ backgroundColor: '#faf9f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section className="smk-subpage-hero">
        <div className="smk-container smk-center">
          <span className="smk-badge">Karya Siswa</span>
          <h1 className="smk-subpage-title">Portofolio &amp; Skill</h1>
          <p className="smk-subpage-subtitle">
            Temukan hasil karya terbaik siswa SMK Negeri 3 Balige yang mencerminkan
            kompetensi dan kreativitas mereka di berbagai bidang.
          </p>
        </div>
      </section>

      <div style={{ flex: 1, padding: '40px 52px' }}>

        {/* Header aksi */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{
              backgroundColor: '#fde68a', padding: '4px 14px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '600', color: '#92400e',
            }}>
              Karya dan Kompetensi Siswa
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '8px 0 0', fontFamily: 'Poppins, sans-serif' }}>
              Daftar Portofolio Siswa
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {!isAuth && (
              <button
                onClick={login}
                style={{
                  backgroundColor: '#1f2c5c', color: 'white', border: 'none',
                  padding: '11px 22px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <Icon name="shield" size={15} /> Masuk
              </button>
            )}

            {isAuth && isSiswa && (
              <button
                onClick={() => navigate('/portofolio/tambah')}
                style={{
                  backgroundColor: '#1f2c5c', color: 'white', border: 'none',
                  padding: '11px 22px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1f2c5c')}
              >
                + Tambah Portofolio
              </button>
            )}

            {isAuth && isSiswa && (
              <button
                onClick={() => {
                  setShowMine((prev) => !prev);
                  setPage(1);
                }}
                style={{
                  backgroundColor: showMine ? '#f3f4f6' : '#e0f2fe',
                  color: showMine ? '#111827' : '#0c4a6e', border: '1px solid #c7d2fe',
                  padding: '11px 18px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins, sans-serif',
                }}
              >
                {showMine ? 'Tampilkan Semua Portofolio' : 'Tampilkan Portofolioku'}
              </button>
            )}
          </div>
        </div>

        {/* Banner status login kustom hanya jika user berhasil masuk */}
        {isAuth && (
          <div style={{
            backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
            padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: '#1d4ed8',
            display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Poppins, sans-serif',
          }}>
            <Icon name="shield" size={14} /> Login sebagai <strong>{namaUser || 'Pengguna'}</strong> — kamu hanya bisa mengedit karya milikmu sendiri.
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '0 0 280px' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: '#9ca3af', pointerEvents: 'none', display: 'flex',
            }}><Icon name="search" size={15} /></span>
            <input
              type="text"
              placeholder="Cari nama, judul, skill..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px',
                border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box', backgroundColor: 'white', color: '#1a1a2e',
                fontFamily: 'Poppins, sans-serif',
              }}
            />
          </div>
          <select
            value={filterJurusan}
            onChange={(e) => { setFilterJurusan(e.target.value); setPage(1); }}
            style={{
              padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
              fontSize: '13px', backgroundColor: 'white', color: '#374151',
              outline: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            }}
          >
            <option value="">Semua Jurusan</option>
            <option value="Tataboga">Tataboga</option>
            <option value="Perhotelan">Perhotelan</option>
          </select>
          <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: 'auto', fontFamily: 'Poppins, sans-serif' }}>
            {(list || []).length} karya ditemukan
          </span>
        </div>

        {/* Tabel */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 1.8fr 2fr 1.4fr 1.1fr 88px',
            padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb',
            color: '#6b7280', fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Poppins, sans-serif',
          }}>
            <span></span>
            <span>Nama Siswa</span>
            <span>Judul Proyek</span>
            <span>Jurusan</span>
            <span>Skill</span>
            <span style={{ textAlign: 'center' }}>Aksi</span>
          </div>

          {loading ? (
            <LoadingRows />
          ) : error ? (
            <EmptyState icon="warning" message={error} />
          ) : paginated.length === 0 ? (
            <EmptyState icon="image" message={search || filterJurusan ? 'Tidak ada hasil yang cocok' : 'Belum ada data portofolio'} />
          ) : (
            paginated.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1.8fr 2fr 1.4fr 1.1fr 88px',
                  padding: '14px 20px',
                  borderBottom: i < paginated.length - 1 ? '1px solid #f3f4f6' : 'none',
                  alignItems: 'center', transition: 'background 0.1s', fontFamily: 'Poppins, sans-serif',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <input type="checkbox" style={{ accentColor: '#1f2c5c' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    backgroundColor: getColor(p.studentName), color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '15px',
                  }}>
                    {getInitial(p.studentName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a2e', cursor: 'pointer' }}
                      onClick={() => navigate(`/portofolio/${p.id}`)}>
                      {p.studentName}
                    </div>
                    <div>
                      <span style={{
                        backgroundColor: '#e0e7ff', color: '#3730a3',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                      }}>
                        {p.major || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ color: '#374151', fontSize: '13px', paddingRight: '12px', lineHeight: '1.4' }}>
                  {p.title}
                </div>

                <div>
                  <span style={{
                    backgroundColor: '#e0e7ff', color: '#3730a3',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                  }}>
                    {p.major || '-'}
                  </span>
                </div>

                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {p.skill
                    ? p.skill.split(',').slice(0, 2).join(', ') + (p.skill.split(',').length > 2 ? '...' : '')
                    : '-'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ActionMenu
                    canEdit={isOwner(p)}
                    onView={() => navigate(`/portofolio/${p.id}`)}
                    onEdit={() => navigate(`/portofolio/edit/${p.id}`)}
                    onDelete={() => handleDelete(p.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '24px', alignItems: 'center' }}>
            <PageBtn label="Prev" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pg) => (
              <PageBtn key={pg} label={pg} active={page === pg} onClick={() => setPage(pg)} />
            ))}
            {totalPages > 7 && <span style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>}
            {totalPages > 7 && <PageBtn label={totalPages} active={page === totalPages} onClick={() => setPage(totalPages)} />}
            <PageBtn label="Next" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '40px 1.8fr 2fr 1.4fr 1.1fr 88px',
          padding: '16px 20px', borderBottom: '1px solid #f3f4f6', gap: '12px', alignItems: 'center',
        }}>
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} style={{
              height: '14px', borderRadius: '6px', backgroundColor: '#f3f4f6',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ))}
    </>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 40px', color: '#9ca3af' }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><Icon name={icon} size={36} /></div>
      <p style={{ margin: 0, fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>{message}</p>
    </div>
  );
}

function PageBtn({ label, onClick, active = false, disabled = false }) {
  const isNum = typeof label === 'number';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: isNum ? '36px' : 'auto', height: '36px',
      padding: isNum ? '0' : '0 14px', borderRadius: '8px',
      border: '1px solid', borderColor: active ? '#1f2c5c' : '#e5e7eb',
      backgroundColor: active ? '#1f2c5c' : disabled ? '#f9fafb' : 'white',
      color: active ? 'white' : disabled ? '#d1d5db' : '#374151',
      cursor: disabled ? 'default' : 'pointer', fontSize: '13px',
      fontWeight: active ? '600' : '400', fontFamily: 'Poppins, sans-serif',
    }}>
      {label}
    </button>
  );
}

export default PortofolioList;