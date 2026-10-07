import { useEffect, useState, useMemo, useRef } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { AdminCard, AdminTable, AdminModal, ActionButtons } from "../components/AdminComponents";
import { showConfirmDialog, showErrorDialog } from "../../../helpers/toolsHelper";

// 1. Import konfigurasi Axios yang sudah mengarah ke API Gateway (Port 6766)
import apiGateway from "../../../config/axios";

// 2. Buat prefix untuk mempersingkat path URL
const PREFIX = "/pelanggaran/surat-panggilan";

function SearchableSiswaSelect({ value, onChange, masterSiswa, loading, onRefresh }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedSiswa = useMemo(() => {
    return masterSiswa.find((s) => s.id === value);
  }, [masterSiswa, value]);

  // Filter siswa berdasarkan nama, kelas, atau NIS
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return masterSiswa;
    return masterSiswa.filter((s) => {
      const nama = (s.nama || "").toLowerCase();
      const kelas = (s.kelas || "").toLowerCase();
      const nis = (s.nis || "").toLowerCase();
      return nama.includes(q) || kelas.includes(q) || nis.includes(q);
    });
  }, [masterSiswa, query]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (siswa) => {
    onChange(siswa.id);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {selectedSiswa && !isOpen ? (
        // Tampilan saat siswa sudah dipilih
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "#f0fdf4",
            border: "1.5px solid #86efac",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Klik untuk mengganti siswa"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#16a34a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              {(selectedSiswa.nama || "S").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: "#166534", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selectedSiswa.nama}
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "11px", color: "#15803d", marginTop: "1px" }}>
                <span style={{ background: "#dcfce7", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
                  Kelas: {selectedSiswa.kelas || "-"}
                </span>
                {selectedSiswa.nis && <span>• NIS: {selectedSiswa.nis}</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ✕ Ganti
          </button>
        </div>
      ) : (
        // Input pencarian saat belum dipilih atau sedang mencari
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "14px",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            className="smk-form-input"
            style={{
              paddingLeft: "36px",
              paddingRight: query ? "32px" : "12px",
              borderColor: isOpen ? "#3b82f6" : undefined,
              boxShadow: isOpen ? "0 0 0 3px rgba(59, 130, 246, 0.15)" : undefined,
              backgroundColor: "#ffffff",
            }}
            placeholder="Ketik nama, NIS, atau kelas siswa..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "14px",
                padding: "2px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Floating Hasil Pencarian Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            maxHeight: "220px",
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          {loading ? (
            <div style={{ padding: "14px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
              ⏳ Memuat data siswa...
            </div>
          ) : masterSiswa.length === 0 ? (
            <div style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "6px" }}>
                Data siswa belum termuat dari server.
              </div>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  🔄 Sinkronkan Data
                </button>
              )}
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ padding: "14px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
              Tidak ditemukan siswa dengan kata kunci "{query}"
            </div>
          ) : (
            <div>
              <div
                style={{
                  padding: "6px 12px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {filteredList.length} Siswa Ditemukan (Klik untuk memilih)
              </div>
              {filteredList.map((s) => {
                const isSelected = s.id === value;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      background: isSelected ? "#eff6ff" : "transparent",
                      transition: "background-color 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? "#1d4ed8" : "#0f172a",
                          fontSize: "13px",
                        }}
                      >
                        {s.nama}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
                        {s.nis ? `NIS: ${s.nis}` : "NIS: -"}
                        {s.no_wa_ortu ? ` • WA: ${s.no_wa_ortu}` : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        borderRadius: "5px",
                        background: isSelected ? "#dbeafe" : "#f1f5f9",
                        color: isSelected ? "#1e40af" : "#475569",
                        border: isSelected ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.kelas || "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPelanggaranPage() {
  const [data, setData] = useState([]);
  const [masterSiswa, setMasterSiswa] = useState([]);
  const [masterGuru, setMasterGuru] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showGuruDropdown, setShowGuruDropdown] = useState(false);
  const [editId, setEditId] = useState(null); 
  
  const [idSiswa, setIdSiswa] = useState("");
  const [noSurat, setNoSurat] = useState("");
  const [permasalahan, setPermasalahan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("09.00 WIB - Selesai");
  const [tempat, setTempat] = useState("Ruang BK SMK Negeri 3 Balige");
  const [idPenandatangan, setIdPenandatangan] = useState([]);

  useEffect(() => {
    fetchData();
    fetchMasterData();
  }, []);

  // ── MENGGUNAKAN AXIOS BUKAN FETCH ────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiGateway.get(PREFIX);
      if (res.data.status === "success") setData(res.data.data);
    } catch (error) {
      console.error("Gagal load data surat:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    setLoadingMaster(true);
    try {
      const resSiswa = await apiGateway.get(`${PREFIX}/master/siswa`);
      if (resSiswa.data.status === "success") setMasterSiswa(resSiswa.data.data);

      const resGuru = await apiGateway.get(`${PREFIX}/master/guru`);
      if (resGuru.data.status === "success") setMasterGuru(resGuru.data.data);
    } catch (error) {
      console.error("Gagal load master data:", error);
    } finally {
      setLoadingMaster(false);
    }
  };

  const handleCheckboxChange = (guruId) => {
    setIdPenandatangan((prev) => 
      prev.includes(guruId) ? prev.filter((id) => id !== guruId) : [...prev, guruId]
    );
  };

  const openAdd = () => {
    setEditId(null);
    setIdSiswa("");
    setNoSurat("");
    setPermasalahan("");
    setTanggal("");
    setWaktu("09.00 WIB - Selesai");
    setTempat("Ruang BK SMK Negeri 3 Balige");
    setIdPenandatangan([]);
    setShowGuruDropdown(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setIdSiswa(item.id_siswa);
    setNoSurat(item.no_surat);
    setPermasalahan(item.permasalahan || "");
    setTanggal(item.tanggal_panggilan);
    setWaktu(item.waktu_panggilan || "");
    setTempat(item.tempat || "");
    setIdPenandatangan(item.id_penandatangan || []);
    setShowGuruDropdown(false);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!idSiswa || !noSurat || !tanggal || idPenandatangan.length === 0) {
      alert("Mohon lengkapi data wajib dan pilih minimal 1 guru penandatangan!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id_siswa: idSiswa,
        no_surat: noSurat,
        permasalahan,
        tanggal_panggilan: tanggal,
        waktu_panggilan: waktu,
        tempat,
        id_penandatangan: idPenandatangan
      };

      const targetUrl = editId ? `${PREFIX}/${editId}` : PREFIX;

      if (editId) {
        await apiGateway.put(targetUrl, payload);
      } else {
        await apiGateway.post(targetUrl, payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan surat. Periksa jaringan backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus surat nomor: ${item.no_surat}?`);
    if (r.isConfirmed) {
      try {
        await apiGateway.delete(`${PREFIX}/${item.id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDownloadPDF = async (id, namaSiswa = "") => {
    // Endpoint PDF butuh Authorization header, jadi harus lewat axios (bukan window.open).
    try {
      const res = await apiGateway.get(`${PREFIX}/${id}/pdf`, { responseType: "blob" });

      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const namaBersih = namaSiswa.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
      const fileName = match
        ? match[1]
        : `Surat_Panggilan_${namaBersih || id}.pdf`;

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mengunduh PDF:", error);
      showErrorDialog("Surat panggilan tidak dapat diunduh. Coba lagi.");
    }
  };

  const handleSendWA = async (id) => {
    try {
      const res = await apiGateway.get(`${PREFIX}/${id}/whatsapp`);
      if (res.data.status === "success") {
        window.open(res.data.data.link_whatsapp, "_blank");
      } else {
        alert(res.data.message || "Gagal membuat link WhatsApp");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat link WA.");
    }
  };

  const getNamaSiswa = (id) => {
    const siswa = masterSiswa.find(s => s.id === id);
    return siswa ? siswa.nama : "Siswa tidak diketahui";
  };

  return (
    <AdminLayout title="Pelanggaran & Surat Panggilan">
      <AdminCard 
        title="Daftar Surat Panggilan" 
        subtitle="Kelola dan cetak surat panggilan orang tua wali" 
        onAdd={openAdd}
        addLabel="+ Buat Surat Baru"
      >
        <AdminTable columns={["No Surat", "Nama Siswa", "Tanggal", "Aksi Terintegrasi", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.no_surat}</strong></td>
              <td>{getNamaSiswa(item.id_siswa)}</td>
              <td>{item.tanggal_panggilan}</td>
              
              <td>
                <div className="smk-admin-actions">
                  <button 
                    onClick={() => handleDownloadPDF(item.id, getNamaSiswa(item.id_siswa))}
                    className="smk-admin-btn-edit" 
                    style={{ backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
                  >
                    Cetak PDF
                  </button>
                  <button 
                    onClick={() => handleSendWA(item.id)}
                    className="smk-admin-btn-edit"
                    style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}
                  >
                    WA Ortu
                  </button>
                </div>
              </td>

              <td>
                <ActionButtons 
                  onEdit={() => openEdit(item)} 
                  onDelete={() => handleDelete(item)} 
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Surat Panggilan" : "Buat Surat Panggilan Baru"}
        onSubmit={handleSubmit} 
        submitting={submitting}
      >
        <div className="smk-form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ margin: 0 }}>
              Pilih Siswa <span style={{ color: "red" }}>*</span>
            </label>
            {masterSiswa.length > 0 && (
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                {masterSiswa.length} siswa terdaftar
              </span>
            )}
          </div>
          <SearchableSiswaSelect
            value={idSiswa}
            onChange={setIdSiswa}
            masterSiswa={masterSiswa}
            loading={loadingMaster}
            onRefresh={fetchMasterData}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Nomor Surat <span style={{color: 'red'}}>*</span></label>
            <input className="smk-form-input" type="text" value={noSurat} onChange={(e) => setNoSurat(e.target.value)} placeholder="421.5/xxx/SMKN3/2026" />
          </div>
          <div className="smk-form-group">
            <label>Tanggal Panggilan <span style={{color: 'red'}}>*</span></label>
            <input className="smk-form-input" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Waktu</label>
            <input className="smk-form-input" type="text" value={waktu} onChange={(e) => setWaktu(e.target.value)} />
          </div>
          <div className="smk-form-group">
            <label>Tempat</label>
            <input className="smk-form-input" type="text" value={tempat} onChange={(e) => setTempat(e.target.value)} />
          </div>
        </div>

        <div className="smk-form-group">
          <label>Permasalahan</label>
          <textarea className="smk-form-input" rows={2} value={permasalahan} onChange={(e) => setPermasalahan(e.target.value)} placeholder="Contoh: Sering bolos dan tidak membuat tugas" />
        </div>

        <div className="smk-form-group">
          <label>Penandatangan <span style={{color: 'red'}}>*</span></label>
          
          <div 
            className="smk-form-input" 
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', userSelect: 'none' }}
            onClick={() => setShowGuruDropdown(!showGuruDropdown)}
          >
            <span style={{ color: idPenandatangan.length ? '#0f2244' : '#94a3b8' }}>
              {idPenandatangan.length > 0 ? `${idPenandatangan.length} Guru Dipilih` : "-- Klik untuk pilih Guru --"}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>{showGuruDropdown ? "▲" : "▼"}</span>
          </div>

          {showGuruDropdown && (
            <div style={{ border: '1px solid #e5e9f2', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px', maxHeight: '160px', overflowY: 'auto', background: '#f8faff', marginTop: '-4px' }}>
              {masterGuru.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>Gagal memuat data guru.</div>
              ) : (
                masterGuru.map(guru => (
                  <label key={guru.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      checked={idPenandatangan.includes(guru.id)}
                      onChange={() => handleCheckboxChange(guru.id)}
                    />
                    <div>
                      <strong style={{ color: '#0f2244' }}>{guru.nama}</strong> <br/>
                      <span style={{color: '#64748b', fontSize: '11px'}}>{guru.jabatan}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      </AdminModal>
    </AdminLayout>
  );
}