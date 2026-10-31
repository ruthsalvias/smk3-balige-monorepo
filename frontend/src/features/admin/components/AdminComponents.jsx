// src/features/admin/components/AdminComponents.jsx
// Komponen reusable untuk semua halaman admin

import { BASE_URL, GATEWAY_URL } from "../../../helpers/apiHelper";
import Icon from "../../../components/Icon";

// ── Normalize path gambar (handle backslash Windows) ─────────
// service-profile menyimpan path relatif (mis. "fasilitas/foo.png") dan
// menyajikannya di /api/profile/uploads/*.
export function mediaUrl(filePath) {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const relative = normalized.replace(/^uploads\//, "");
  return `${BASE_URL}/uploads/${relative}`;
}

// service-berita menyajikan gambarnya di /uploads/* pada root gateway.
export function beritaMediaUrl(filePath) {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const relative = normalized.replace(/^uploads\//, "");
  return `${GATEWAY_URL}/uploads/${relative}`;
}

// ── Stat Card ─────────────────────────────────────────────────
export function AdminStatCard({ icon, value, label, color = "blue" }) {
  return (
    <div className="smk-admin-stat-card">
      <div className={`smk-admin-stat-icon smk-admin-stat-${color}`}>{icon}</div>
      <div className="smk-admin-stat-info">
        <strong className="smk-admin-stat-val">{value ?? "—"}</strong>
        <span className="smk-admin-stat-lbl">{label}</span>
      </div>
    </div>
  );
}

// ── Data Card wrapper ─────────────────────────────────────────
export function AdminCard({ title, subtitle, onAdd, addLabel = "+ Tambah", children }) {
  return (
    <div className="smk-admin-card">
      <div className="smk-admin-card-header">
        <div>
          <div className="smk-admin-card-title">{title}</div>
          {subtitle && <div className="smk-admin-card-sub">{subtitle}</div>}
        </div>
        {onAdd && (
          <button className="smk-btn-primary smk-admin-btn-sm" onClick={onAdd}>
            {addLabel}
          </button>
        )}
      </div>
      <div className="smk-admin-card-body">{children}</div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
export function AdminTable({ columns, children, loading, empty }) {
  return (
    <div className="smk-admin-table-wrap">
      <table className="smk-admin-table">
        <thead>
          <tr>
            {columns.map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="smk-admin-table-state">
                <span className="smk-admin-spinner" /> Memuat data...
              </td>
            </tr>
          ) : empty ? (
            <tr>
              <td colSpan={columns.length} className="smk-admin-table-state">
                <Icon name="image" size={18} /> Belum ada data
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

// ── Thumbnail gambar ──────────────────────────────────────────
export function AdminThumb({ src, fallback = <Icon name="image" size={18} /> }) {
  if (!src) return <div className="smk-admin-thumb">{fallback}</div>;
  return (
    <div className="smk-admin-thumb">
      <img
        src={src}
        alt=""
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
      <span style={{ display: "none" }}>{fallback}</span>
    </div>
  );
}

// ── Badge tingkat ──────────────────────────────────────────────
export function TingkatBadge({ tingkat }) {
  const map = {
    internasional: ["smk-admin-badge-gold",   "Internasional"],
    nasional:      ["smk-admin-badge-silver",  "Nasional"],
    provinsi:      ["smk-admin-badge-bronze",  "Provinsi"],
    kabupaten:     ["smk-admin-badge-blue",    "Kabupaten"],
  };
  const [cls, label] = map[tingkat?.toLowerCase()] ?? ["smk-admin-badge-blue", tingkat];
  return <span className={`smk-admin-badge ${cls}`}>{label}</span>;
}

// ── Upload area ───────────────────────────────────────────────
export function UploadArea({ id, onFile, preview, label = "Klik untuk pilih gambar" }) {
  return (
    <div className="smk-form-group">
      <label htmlFor={id} className="smk-upload-area">
        <Icon name="upload" size={28} className="smk-upload-icon" />
        <div>
          <span style={{ color: "var(--blue)", fontWeight: 600 }}>{label}</span>
          {" "}atau drag & drop
        </div>
        <div style={{ fontSize: 11, marginTop: 4, color: "var(--text-gray)" }}>
          PNG, JPG, WEBP — Maks 5MB
        </div>
        <input
          type="file"
          id={id}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => onFile && onFile(e.target.files[0])}
        />
      </label>
      {preview && (
        <div className="smk-admin-upload-preview">
          <img src={preview} alt="preview" />
        </div>
      )}
    </div>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────
export function AdminModal({ open, onClose, title, children, onSubmit, submitting }) {
  if (!open) return null;
  return (
    <div className="smk-modal-overlay" onClick={onClose}>
      <div
        className="smk-modal smk-admin-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="smk-modal-header">
          <h3>{title}</h3>
          <button className="smk-modal-close" onClick={onClose} aria-label="Tutup">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="smk-modal-body">{children}</div>
        <div className="smk-modal-footer">
          <button className="smk-btn-cancel" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button className="smk-btn-primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <><span className="smk-admin-spinner smk-admin-spinner-sm" /> Menyimpan...</>
            ) : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Aksi button group ──────────────────────────────────────────
export function ActionButtons({ onEdit, onDelete, onPin, pinned = false }) {
  return (
    <div className="smk-admin-actions">
      {onPin && (
        <button
          className={`smk-admin-btn-pin${pinned ? " is-pinned" : ""}`}
          onClick={onPin}
          title={pinned ? "Lepas sematan" : "Sematkan di urutan teratas"}
        >
          <Icon name="pin" size={15} /> {pinned ? "Tersemat" : "Sematkan"}
        </button>
      )}
      <button className="smk-admin-btn-edit" onClick={onEdit}>
        <Icon name="edit" size={15} /> Edit
      </button>
      <button className="smk-admin-btn-delete" onClick={onDelete}>
        <Icon name="trash" size={15} /> Hapus
      </button>
    </div>
  );
}
