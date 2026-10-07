// src/features/admin/pages/AdminVisiMisiPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../layouts/AdminLayout";
import { AdminCard, AdminTable, AdminModal, ActionButtons } from "../components/AdminComponents";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import Icon from "../../../components/Icon";
import {
  asyncGetVisiMisi, asyncPostVisiMisi,
  asyncPutVisiMisi, asyncDeleteVisiMisi,
} from "../../profil/states/action";

export function AdminVisiMisiPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.visiMisi);
  const loading  = useSelector((s) => s.profilLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tipe, setTipe]             = useState("visi");
  const [deskripsi, setDeskripsi]   = useInput("");

  useEffect(() => { dispatch(asyncGetVisiMisi()); }, [dispatch]);

  const openAdd = () => {
    setEditItem(null); setTipe("visi");
    setDeskripsi({ target: { value: "" } });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item); setTipe(item.tipe);
    setDeskripsi({ target: { value: item.deskripsi } });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const cb = () => { setModalOpen(false); setSubmitting(false); };
    if (editItem) dispatch(asyncPutVisiMisi(editItem.id, tipe, deskripsi, cb));
    else          dispatch(asyncPostVisiMisi(tipe, deskripsi, cb));
    setTimeout(() => setSubmitting(false), 3000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus ${item.tipe} ini?`);
    if (r.isConfirmed) dispatch(asyncDeleteVisiMisi(item.id));
  };

  return (
    <AdminLayout title="Visi & Misi">
      <AdminCard title="Visi & Misi" subtitle="Kelola visi dan misi sekolah" onAdd={openAdd}>
        <AdminTable columns={["Tipe", "Deskripsi", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={`smk-admin-badge ${item.tipe === "visi" ? "smk-admin-badge-blue" : "smk-admin-badge-red"}`}>
                  {item.tipe === "visi" ? "Visi" : "Misi"}
                </span>
              </td>
              <td className="smk-admin-td-truncate">{item.deskripsi?.slice(0, 100)}...</td>
              <td><ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} /></td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Visi/Misi" : "Tambah Visi/Misi"}
        onSubmit={handleSubmit} submitting={submitting}>
        <div className="smk-form-group">
          <label>Tipe</label>
          <select className="smk-form-input" value={tipe} onChange={(e) => setTipe(e.target.value)}>
            <option value="visi">Visi</option>
            <option value="misi">Misi</option>
          </select>
        </div>
        <div className="smk-form-group">
          <label>Deskripsi</label>
          <textarea className="smk-form-input" rows={5} value={deskripsi} onChange={setDeskripsi} placeholder="Tuliskan visi atau misi..." />
        </div>
      </AdminModal>
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// STRUKTUR ORGANISASI
// ─────────────────────────────────────────────────────────────
import {
  asyncGetStrukturOrganisasi, asyncPostStrukturOrganisasi,
  asyncDeleteStrukturOrganisasi,
} from "../../profil/states/action";
import { AdminThumb, UploadArea, mediaUrl } from "../components/AdminComponents";

export function AdminStrukturPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.strukturOrganisasi);
  const loading  = useSelector((s) => s.profilLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(asyncGetStrukturOrganisasi()); }, [dispatch]);

  const handleFile = (f) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleUpload = () => {
    if (!file) return;
    setSubmitting(true);
    const cb = () => { setModalOpen(false); setFile(null); setPreview(null); setSubmitting(false); };
    dispatch(asyncPostStrukturOrganisasi(file, cb));
    setTimeout(() => setSubmitting(false), 5000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog("Hapus gambar struktur organisasi ini?");
    if (r.isConfirmed) dispatch(asyncDeleteStrukturOrganisasi(item.id));
  };

  return (
    <AdminLayout title="Struktur Organisasi">
      <AdminCard
        title="Struktur Organisasi"
        subtitle="Upload gambar bagan struktur organisasi"
        onAdd={() => { setFile(null); setPreview(null); setModalOpen(true); }}
        addLabel="+ Upload Gambar"
      >
        <AdminTable columns={["Preview", "Path File", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><AdminThumb src={mediaUrl(item.gambar)} fallback={<Icon name="sitemap" size={18} />} /></td>
              <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-gray)" }}>
                {item.gambar}
              </td>
              <td>
                <button className="smk-admin-btn-delete" onClick={() => handleDelete(item)}>
                  <Icon name="trash" size={15} /> Hapus
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      {/* Upload Modal */}
      {modalOpen && (
        <div className="smk-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="smk-modal smk-admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="smk-modal-header">
              <h3>Upload Struktur Organisasi</h3>
              <button className="smk-modal-close" onClick={() => setModalOpen(false)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="smk-modal-body">
              <UploadArea id="strukturFile" onFile={handleFile} preview={preview} label="Pilih gambar struktur" />
            </div>
            <div className="smk-modal-footer">
              <button className="smk-btn-cancel" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="smk-btn-primary" onClick={handleUpload} disabled={submitting || !file}>
                {submitting ? <><span className="smk-admin-spinner smk-admin-spinner-sm" /> Mengupload...</> : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// PROGRAM KEAHLIAN
// ─────────────────────────────────────────────────────────────
import {
  asyncGetProgramKeahlian, asyncPostProgramKeahlian,
  asyncPutProgramKeahlian, asyncDeleteProgramKeahlian,
} from "../../profil/states/action";

// Ikon jurusan — Tata Boga & Tata Busana di atas, sisanya ikon umum cadangan
const PROGRAM_ICON_OPTIONS = [
  // === Jurusan aktif ===
  { name: "utensils",   label: "Tata Boga" },
  { name: "scissors",   label: "Tata Busana" },
  // === Umum / cadangan ===
  { name: "graduation", label: "Akademik" },
  { name: "coffee",     label: "Perhotelan" },
  { name: "laptop",     label: "Komputer" },
  { name: "monitor",    label: "TKJ" },
  { name: "code",       label: "Pemrograman" },
  { name: "wrench",     label: "Mekanik" },
  { name: "zap",        label: "Listrik" },
  { name: "car",        label: "Otomotif" },
  { name: "building",   label: "Bangunan" },
  { name: "camera",     label: "Fotografi" },
  { name: "image",      label: "Multimedia" },
  { name: "palette",    label: "Seni/Desain" },
  { name: "briefcase",  label: "Perkantoran" },
  { name: "chart",      label: "Akuntansi" },
  { name: "book",       label: "Literasi" },
  { name: "shield",     label: "K3" },
  { name: "star",       label: "Unggulan" },
  { name: "trophy",     label: "Prestasi" },
];

export function AdminProgramPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.programKeahlian);
  const loading  = useSelector((s) => s.profilLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nama, setNama]             = useInput("");
  const [deskripsi, setDeskripsi]   = useInput("");
  const [icon, setIcon]             = useState("graduation");

  useEffect(() => { dispatch(asyncGetProgramKeahlian()); }, [dispatch]);

  const openAdd = () => {
    setEditItem(null);
    setNama({ target: { value: "" } });
    setDeskripsi({ target: { value: "" } });
    setIcon("graduation");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setNama({ target: { value: item.nama_jurusan } });
    setDeskripsi({ target: { value: item.deskripsi ?? "" } });
    setIcon(item.icon || "graduation");
    setModalOpen(true);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const cb = () => { setModalOpen(false); setSubmitting(false); };
    if (editItem) dispatch(asyncPutProgramKeahlian(editItem.id, nama, deskripsi, icon, cb));
    else          dispatch(asyncPostProgramKeahlian(nama, deskripsi, icon, cb));
    setTimeout(() => setSubmitting(false), 3000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus program "${item.nama_jurusan}"?`);
    if (r.isConfirmed) dispatch(asyncDeleteProgramKeahlian(item.id));
  };

  return (
    <AdminLayout title="Program Keahlian">
      <AdminCard title="Program Keahlian" subtitle="Kelola jurusan dan program keahlian" onAdd={openAdd}>
        <AdminTable columns={["Nama Jurusan", "Deskripsi", "Icon", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.nama_jurusan}</strong></td>
              <td className="smk-admin-td-truncate">{item.deskripsi?.slice(0, 80)}</td>
              <td>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className="smk-stat-icon-cell" style={{ width: 34, height: 34, borderRadius: 8 }}>
                    <Icon name={item.icon || "graduation"} size={18} />
                  </span>
                  <span style={{ fontSize: 13, color: "#334155" }}>
                    {PROGRAM_ICON_OPTIONS.find((o) => o.name === item.icon)?.label || item.icon || "Akademik"}
                  </span>
                </div>
              </td>
              <td><ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} /></td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Program Keahlian" : "Tambah Program Keahlian"}
        onSubmit={handleSubmit} submitting={submitting}>
        <div className="smk-form-group">
          <label>Nama Jurusan</label>
          <input className="smk-form-input" type="text" value={nama} onChange={setNama} placeholder="contoh: Teknik Komputer & Jaringan" />
        </div>
        <div className="smk-form-group">
          <label>Pilih Icon Jurusan</label>
          <div className="smk-icon-picker" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            gap: 8,
            maxHeight: 260,
            overflowY: "auto",
            padding: 4,
          }}>
            {PROGRAM_ICON_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.name}
                className={`smk-icon-option${(icon || "graduation") === opt.name ? " active" : ""}`}
                onClick={() => setIcon(opt.name)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  height: 64,
                  padding: "6px 4px",
                }}
              >
                <Icon name={opt.name} size={22} />
                <span style={{ fontSize: 10, lineHeight: 1.2, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="smk-form-group">
          <label>Deskripsi</label>
          <textarea className="smk-form-input" rows={4} value={deskripsi} onChange={setDeskripsi} placeholder="Deskripsi program keahlian..." />
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
