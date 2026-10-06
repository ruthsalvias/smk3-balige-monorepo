import { useEffect, useState, useRef, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../../../components/Icon";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  getExplorer,
  searchSkl,
  getSklStats,
  createFolder,
  updateFolder,
  deleteFolder,
  uploadFiles,
  updateFile,
  deleteFile,
  downloadFile,
  getPreviewBlobUrl,
  formatBytes,
  formatDate,
} from "../api/sklApi";
import "../resources/admin-skl.css";

const FOLDER_COLORS = [
  { id: "amber", bg: "#f59e0b", label: "Kuning / Gold" },
  { id: "blue", bg: "#3b82f6", label: "Biru" },
  { id: "green", bg: "#10b981", label: "Hijau" },
  { id: "purple", bg: "#8b5cf6", label: "Ungu" },
  { id: "rose", bg: "#f43f5e", label: "Merah / Rose" },
];

export default function AdminSklPage() {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, nama: "Drive SKL" }]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ totalFolders: 0, totalFiles: 0, totalBytes: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Modal States
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("blue");

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadYear, setUploadYear] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileYear, setFileYear] = useState("");
  const [fileNotes, setFileNotes] = useState("");

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load Folder Content
  const loadContent = async (folderId = currentFolderId) => {
    setLoading(true);
    try {
      const data = await getExplorer(folderId);
      setBreadcrumbs(data.breadcrumbs || [{ id: null, nama: "Drive SKL" }]);
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setCurrentFolderId(folderId);
    } catch (err) {
      showErrorDialog(err.message || "Gagal memuat isi direktori");
    } finally {
      setLoading(false);
    }
  };

  // Load Overall Stats
  const loadStats = async () => {
    try {
      const data = await getSklStats();
      setStats({
        totalFolders: data.totalFolders || 0,
        totalFiles: data.totalFiles || 0,
        totalBytes: data.totalBytes || 0,
      });
    } catch (err) {
      console.error("Gagal memuat stats:", err);
    }
  };

  useEffect(() => {
    loadContent(null);
    loadStats();
  }, []);

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearching(false);
      loadContent(currentFolderId);
      return;
    }

    setLoading(true);
    setSearching(true);
    try {
      const result = await searchSkl(searchQuery.trim());
      setFolders(result.folders || []);
      setFiles(result.files || []);
    } catch (err) {
      showErrorDialog(err.message || "Pencarian gagal");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearching(false);
    loadContent(currentFolderId);
  };

  // Navigasi Folder
  const enterFolder = (folder) => {
    setSearchQuery("");
    setSearching(false);
    loadContent(folder.id);
  };

  const navigateBreadcrumb = (crumbId) => {
    setSearchQuery("");
    setSearching(false);
    loadContent(crumbId);
  };

  // --- Folder Management ---
  const openNewFolderModal = () => {
    setEditingFolder(null);
    setFolderName("");
    setFolderColor("blue");
    setFolderModalOpen(true);
  };

  const openEditFolderModal = (folder, e) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setFolderName(folder.nama);
    setFolderColor(folder.warna || "blue");
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      showErrorDialog("Nama folder tidak boleh kosong");
      return;
    }

    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, {
          nama: folderName.trim(),
          warna: folderColor,
        });
        showSuccessDialog("Folder berhasil diperbarui");
      } else {
        await createFolder({
          nama: folderName.trim(),
          parentId: currentFolderId,
          warna: folderColor,
        });
        showSuccessDialog("Folder baru berhasil dibuat");
      }
      setFolderModalOpen(false);
      loadContent(currentFolderId);
      loadStats();
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const handleDeleteFolder = async (folder, e) => {
    e.stopPropagation();
    const result = await showConfirmDialog(
      `Hapus folder "${folder.nama}" beserta seluruh subfolder dan file di dalamnya?`,
      "Tindakan ini tidak dapat dibatalkan!"
    );
    if (!result.isConfirmed) return;

    try {
      await deleteFolder(folder.id);
      showSuccessDialog("Folder berhasil dihapus");
      loadContent(currentFolderId);
      loadStats();
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  // --- File Upload ---
  const openUploadModal = () => {
    setSelectedFiles([]);
    setUploadYear("");
    setUploadNotes("");
    setUploadModalOpen(true);
  };

  const handleFilesChosen = (e) => {
    const chosen = Array.from(e.target.files || []);
    if (chosen.length > 0) {
      setSelectedFiles((prev) => [...prev, ...chosen]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      setSelectedFiles((prev) => [...prev, ...dropped]);
    }
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProcessUpload = async () => {
    if (selectedFiles.length === 0) {
      showErrorDialog("Pilih minimal satu file SKL untuk diunggah");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadFiles(selectedFiles, {
        folderId: currentFolderId,
        tahunLulus: uploadYear,
        keterangan: uploadNotes,
      });
      showSuccessDialog(`${res.count || selectedFiles.length} file SKL berhasil diunggah!`);
      setUploadModalOpen(false);
      setSelectedFiles([]);
      loadContent(currentFolderId);
      loadStats();
    } catch (err) {
      showErrorDialog(err.message || "Gagal mengunggah file");
    } finally {
      setIsUploading(false);
    }
  };

  // --- File Actions ---
  const openEditFileModal = (file) => {
    setEditingFile(file);
    setFileName(file.namaFile);
    setFileYear(file.tahunLulus || "");
    setFileNotes(file.keterangan || "");
    setFileModalOpen(true);
  };

  const handleSaveFile = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) {
      showErrorDialog("Nama file tidak boleh kosong");
      return;
    }

    try {
      await updateFile(editingFile.id, {
        namaFile: fileName.trim(),
        tahunLulus: fileYear,
        keterangan: fileNotes,
      });
      showSuccessDialog("Informasi file berhasil diperbarui");
      setFileModalOpen(false);
      loadContent(currentFolderId);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const handleDeleteFile = async (file) => {
    const result = await showConfirmDialog(`Hapus file "${file.namaFile}"?`);
    if (!result.isConfirmed) return;

    try {
      await deleteFile(file.id);
      showSuccessDialog("File berhasil dihapus");
      loadContent(currentFolderId);
      loadStats();
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.id, file.namaFile);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const handlePreview = async (file) => {
    setPreviewFile(file);
    setPreviewUrl(null);
    setLoadingPreview(true);
    setPreviewModalOpen(true);

    try {
      const blobUrl = await getPreviewBlobUrl(file.id);
      setPreviewUrl(blobUrl);
    } catch (err) {
      showErrorDialog("Gagal membuka pratinjau file: " + err.message);
      setPreviewModalOpen(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreviewModal = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewModalOpen(false);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  // Helper file badge
  const getFileBadgeClass = (mime = "", filename = "") => {
    const ext = filename.split(".").pop().toLowerCase();
    if (mime.includes("pdf") || ext === "pdf") return "pdf";
    if (mime.includes("image") || ["jpg", "jpeg", "png"].includes(ext)) return "image";
    if (mime.includes("word") || ["doc", "docx"].includes(ext)) return "doc";
    return "other";
  };

  const getFileBadgeLabel = (mime = "", filename = "") => {
    const ext = filename.split(".").pop().toUpperCase();
    return ext || "FILE";
  };

  return (
    <AdminLayout
      title="Penyimpanan SKL"
      subtitle="Manajemen berkas Surat Keterangan Lulus siswa berbasis folder fleksibel (Google Drive style)"
    >
      <div className="skl-drive-container">
        {/* --- Quick Storage Stats Banner --- */}
        <div className="skl-stats-bar">
          <div className="skl-stat-card">
            <div className="skl-stat-icon folders">
              <Icon name="folder" size={24} />
            </div>
            <div className="skl-stat-info">
              <h4>Total Folder</h4>
              <div className="stat-value">{stats.totalFolders} Folder</div>
            </div>
          </div>

          <div className="skl-stat-card">
            <div className="skl-stat-icon files">
              <Icon name="fileText" size={24} />
            </div>
            <div className="skl-stat-info">
              <h4>Total Dokumen SKL</h4>
              <div className="stat-value">{stats.totalFiles} File</div>
            </div>
          </div>

          <div className="skl-stat-card">
            <div className="skl-stat-icon storage">
              <Icon name="chart" size={24} />
            </div>
            <div className="skl-stat-info">
              <h4>Kapasitas Terpakai</h4>
              <div className="stat-value">{formatBytes(stats.totalBytes)}</div>
            </div>
          </div>
        </div>

        {/* --- Main Toolbar / Action Bar --- */}
        <div className="skl-toolbar">
          {/* Breadcrumbs Navigation */}
          <div className="skl-breadcrumbs">
            {searching ? (
              <span className="skl-crumb-item active">
                <Icon name="search" size={16} />
                Hasil Pencarian: "{searchQuery}"
              </span>
            ) : (
              breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={crumb.id || "root"} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    {idx > 0 && <span className="skl-crumb-sep">/</span>}
                    <button
                      type="button"
                      className={`skl-crumb-item ${isLast ? "active" : ""}`}
                      onClick={() => !isLast && navigateBreadcrumb(crumb.id)}
                    >
                      {idx === 0 && <Icon name="folder" size={16} />}
                      {crumb.nama}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons & Search */}
          <div className="skl-toolbar-actions">
            <form onSubmit={handleSearch} className="skl-search-box">
              <span className="skl-search-icon">
                <Icon name="search" size={16} />
              </span>
              <input
                type="text"
                className="skl-search-input"
                placeholder="Cari file atau folder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="skl-search-clear" onClick={clearSearch}>
                  <Icon name="close" size={14} />
                </button>
              )}
            </form>

            <button
              type="button"
              className="skl-btn skl-btn-secondary"
              onClick={openNewFolderModal}
            >
              <Icon name="folderPlus" size={18} />
              Folder Baru
            </button>

            <button
              type="button"
              className="skl-btn skl-btn-primary"
              onClick={openUploadModal}
            >
              <Icon name="upload" size={18} />
              Upload File SKL
            </button>

            <div className="skl-view-toggle">
              <button
                type="button"
                className={`skl-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                title="Tampilan Grid"
                onClick={() => setViewMode("grid")}
              >
                <Icon name="grid" size={16} />
              </button>
              <button
                type="button"
                className={`skl-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                title="Tampilan List"
                onClick={() => setViewMode("list")}
              >
                <Icon name="list" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Content Area --- */}
        {loading ? (
          <div className="skl-empty-state" style={{ padding: "4rem 1rem" }}>
            <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }} />
            <p style={{ marginTop: "1rem", color: "#64748b" }}>Memuat isi penyimpanan SKL...</p>
          </div>
        ) : (
          <>
            {/* 1. Folders Section */}
            {folders.length > 0 && (
              <div>
                <div className="skl-section-title">
                  <Icon name="folder" size={18} />
                  Folder
                  <span className="count-badge">{folders.length}</span>
                </div>
                <div className="skl-folders-grid">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="skl-folder-card"
                      onClick={() => enterFolder(folder)}
                    >
                      <div className="skl-folder-main">
                        <div className={`skl-folder-icon color-${folder.warna || "blue"}`}>
                          <Icon name="folder" size={32} />
                        </div>
                        <div className="skl-folder-meta">
                          <div className="skl-folder-name" title={folder.nama}>
                            {folder.nama}
                          </div>
                          <div className="skl-folder-sub">
                            {folder.fileCount || 0} file
                            {folder.subfolderCount > 0 ? ` • ${folder.subfolderCount} subfolder` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="skl-item-actions">
                        <button
                          type="button"
                          className="skl-action-icon-btn"
                          title="Ubah nama"
                          onClick={(e) => openEditFolderModal(folder, e)}
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          type="button"
                          className="skl-action-icon-btn danger"
                          title="Hapus folder"
                          onClick={(e) => handleDeleteFolder(folder, e)}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Files Section */}
            {files.length > 0 ? (
              <div>
                <div className="skl-section-title">
                  <Icon name="fileText" size={18} />
                  Dokumen SKL
                  <span className="count-badge">{files.length}</span>
                </div>

                {viewMode === "grid" ? (
                  /* Grid Card View */
                  <div className="skl-files-grid">
                    {files.map((file) => {
                      const badgeClass = getFileBadgeClass(file.mimeType, file.namaFile);
                      const badgeLabel = getFileBadgeLabel(file.mimeType, file.namaFile);
                      return (
                        <div key={file.id} className="skl-file-card">
                          <div className="skl-file-top">
                            <span className={`skl-file-type-badge ${badgeClass}`}>
                              {badgeLabel}
                            </span>
                            <div className="skl-item-actions">
                              <button
                                type="button"
                                className="skl-action-icon-btn"
                                title="Edit info"
                                onClick={() => openEditFileModal(file)}
                              >
                                <Icon name="edit" size={15} />
                              </button>
                              <button
                                type="button"
                                className="skl-action-icon-btn danger"
                                title="Hapus file"
                                onClick={() => handleDeleteFile(file)}
                              >
                                <Icon name="trash" size={15} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="skl-file-title" title={file.namaFile}>
                              {file.namaFile}
                            </div>
                            <div className="skl-file-meta-row">
                              {file.tahunLulus && (
                                <span className="skl-year-pill">
                                  Tahun {file.tahunLulus}
                                </span>
                              )}
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>

                          <div className="skl-file-bottom">
                            <span className="skl-file-size">
                              {formatBytes(file.ukuran)}
                            </span>
                            <div className="skl-file-actions-row">
                              <button
                                type="button"
                                className="skl-btn skl-btn-secondary"
                                style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                                onClick={() => handlePreview(file)}
                                title="Lihat dokumen"
                              >
                                <Icon name="eye" size={14} />
                                Lihat
                              </button>
                              <button
                                type="button"
                                className="skl-btn skl-btn-primary"
                                style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                                onClick={() => handleDownload(file)}
                                title="Unduh file"
                              >
                                <Icon name="download" size={14} />
                                Unduh
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* List Table View */
                  <div className="skl-table-container">
                    <table className="skl-table">
                      <thead>
                        <tr>
                          <th>Nama Dokumen</th>
                          <th>Tahun Lulus</th>
                          <th>Ukuran</th>
                          <th>Tanggal Unggah</th>
                          <th style={{ textAlign: "right" }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((file) => {
                          const badgeClass = getFileBadgeClass(file.mimeType, file.namaFile);
                          const badgeLabel = getFileBadgeLabel(file.mimeType, file.namaFile);
                          return (
                            <tr key={file.id}>
                              <td>
                                <div
                                  className="skl-table-name-cell"
                                  onClick={() => handlePreview(file)}
                                >
                                  <span className={`skl-file-type-badge ${badgeClass}`}>
                                    {badgeLabel}
                                  </span>
                                  <span title={file.namaFile}>{file.namaFile}</span>
                                </div>
                              </td>
                              <td>
                                {file.tahunLulus ? (
                                  <span className="skl-year-pill">Tahun {file.tahunLulus}</span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td>{formatBytes(file.ukuran)}</td>
                              <td>{formatDate(file.createdAt)}</td>
                              <td>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem" }}>
                                  <button
                                    type="button"
                                    className="skl-action-icon-btn"
                                    title="Lihat"
                                    onClick={() => handlePreview(file)}
                                  >
                                    <Icon name="eye" size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="skl-action-icon-btn"
                                    title="Unduh"
                                    onClick={() => handleDownload(file)}
                                  >
                                    <Icon name="download" size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="skl-action-icon-btn"
                                    title="Edit"
                                    onClick={() => openEditFileModal(file)}
                                  >
                                    <Icon name="edit" size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="skl-action-icon-btn danger"
                                    title="Hapus"
                                    onClick={() => handleDeleteFile(file)}
                                  >
                                    <Icon name="trash" size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            {/* Empty State when no folders and no files */}
            {folders.length === 0 && files.length === 0 && (
              <div className="skl-empty-state">
                <div className="skl-empty-icon">📁</div>
                <h3>{searching ? "Tidak ada hasil pencarian" : "Folder Ini Masih Kosong"}</h3>
                <p>
                  {searching
                    ? `Tidak ditemukan folder atau file yang cocok dengan kata kunci "${searchQuery}".`
                    : "Belum ada dokumen atau subfolder di sini. Anda dapat membuat folder baru atau mengunggah berkas SKL sekarang."}
                </p>
                {!searching && (
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      className="skl-btn skl-btn-secondary"
                      onClick={openNewFolderModal}
                    >
                      <Icon name="folderPlus" size={18} />
                      Buat Folder
                    </button>
                    <button
                      type="button"
                      className="skl-btn skl-btn-primary"
                      onClick={openUploadModal}
                    >
                      <Icon name="upload" size={18} />
                      Upload File SKL
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* =================================================================
            MODALS
           ================================================================= */}

        {/* 1. Modal Buat / Edit Folder */}
        {folderModalOpen && (
          <div className="skl-modal-overlay" onClick={() => setFolderModalOpen(false)}>
            <div className="skl-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="skl-modal-header">
                <h3>
                  <Icon name="folder" size={20} />
                  {editingFolder ? "Ubah Nama Folder" : "Folder Baru"}
                </h3>
                <button
                  type="button"
                  className="skl-action-icon-btn"
                  onClick={() => setFolderModalOpen(false)}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveFolder}>
                <div className="skl-modal-body">
                  <div className="skl-form-group">
                    <label>Nama Folder</label>
                    <input
                      type="text"
                      className="skl-form-input"
                      placeholder="Contoh: Tataboga 2022 / Kelas 12 A"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="skl-form-group">
                    <label>Warna Folder</label>
                    <div className="skl-color-options">
                      {FOLDER_COLORS.map((col) => (
                        <div
                          key={col.id}
                          className={`skl-color-dot ${folderColor === col.id ? "active" : ""}`}
                          style={{ backgroundColor: col.bg }}
                          title={col.label}
                          onClick={() => setFolderColor(col.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="skl-modal-footer">
                  <button
                    type="button"
                    className="skl-btn skl-btn-secondary"
                    onClick={() => setFolderModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="skl-btn skl-btn-primary">
                    {editingFolder ? "Simpan Perubahan" : "Buat Folder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Modal Upload File SKL (Multi-file & Drag and Drop) */}
        {uploadModalOpen && (
          <div className="skl-modal-overlay" onClick={() => !isUploading && setUploadModalOpen(false)}>
            <div className="skl-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="skl-modal-header">
                <h3>
                  <Icon name="upload" size={20} />
                  Upload Berkas SKL
                </h3>
                <button
                  type="button"
                  className="skl-action-icon-btn"
                  disabled={isUploading}
                  onClick={() => setUploadModalOpen(false)}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="skl-modal-body">
                {/* Drag and drop zone */}
                <div
                  className="skl-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>📄</div>
                  <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "0.25rem" }}>
                    Tarik dan lepaskan file SKL di sini
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                    atau klik untuk memilih file dari komputer (bisa pilih banyak file sekaligus)
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                    Mendukung PDF, Word (.doc/.docx), dan Gambar
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    style={{ display: "none" }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFilesChosen}
                  />
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
                      File yang Dipilih ({selectedFiles.length}):
                    </div>
                    <div className="skl-upload-list">
                      {selectedFiles.map((f, idx) => (
                        <div key={idx} className="skl-upload-item">
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "340px" }}>
                            {f.name} ({formatBytes(f.size)})
                          </span>
                          {!isUploading && (
                            <button
                              type="button"
                              className="skl-action-icon-btn danger"
                              onClick={() => removeSelectedFile(idx)}
                              title="Hapus dari antrean"
                            >
                              <Icon name="close" size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata input (optional batch year & notes) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
                  <div className="skl-form-group">
                    <label>Tahun Lulus (Opsional)</label>
                    <input
                      type="text"
                      className="skl-form-input"
                      placeholder="Contoh: 2023"
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="skl-form-group">
                    <label>Keterangan Tambahan</label>
                    <input
                      type="text"
                      className="skl-form-input"
                      placeholder="Contoh: Gelombang 1 / Jalur Reguler"
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>
                </div>
              </div>

              <div className="skl-modal-footer">
                <button
                  type="button"
                  className="skl-btn skl-btn-secondary"
                  disabled={isUploading}
                  onClick={() => setUploadModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="skl-btn skl-btn-primary"
                  disabled={isUploading || selectedFiles.length === 0}
                  onClick={handleProcessUpload}
                >
                  {isUploading ? (
                    <>Mengunggah {selectedFiles.length} file...</>
                  ) : (
                    <>
                      <Icon name="upload" size={16} />
                      Unggah {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""} File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Modal Edit Info File */}
        {fileModalOpen && (
          <div className="skl-modal-overlay" onClick={() => setFileModalOpen(false)}>
            <div className="skl-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="skl-modal-header">
                <h3>
                  <Icon name="edit" size={20} />
                  Edit Informasi File
                </h3>
                <button
                  type="button"
                  className="skl-action-icon-btn"
                  onClick={() => setFileModalOpen(false)}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveFile}>
                <div className="skl-modal-body">
                  <div className="skl-form-group">
                    <label>Nama File</label>
                    <input
                      type="text"
                      className="skl-form-input"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="skl-form-group">
                    <label>Tahun Lulus</label>
                    <input
                      type="text"
                      className="skl-form-input"
                      placeholder="Contoh: 2023"
                      value={fileYear}
                      onChange={(e) => setFileYear(e.target.value)}
                    />
                  </div>

                  <div className="skl-form-group">
                    <label>Keterangan</label>
                    <textarea
                      className="skl-form-input"
                      rows={2}
                      placeholder="Catatan / keterangan dokumen..."
                      value={fileNotes}
                      onChange={(e) => setFileNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="skl-modal-footer">
                  <button
                    type="button"
                    className="skl-btn skl-btn-secondary"
                    onClick={() => setFileModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="skl-btn skl-btn-primary">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Modal Pratinjau Dokumen (Inline PDF & Image Viewer) */}
        {previewModalOpen && (
          <div className="skl-modal-overlay" onClick={closePreviewModal}>
            <div
              className="skl-modal-dialog preview-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="skl-modal-header">
                <h3>
                  <Icon name="fileText" size={20} />
                  {previewFile?.namaFile || "Pratinjau Dokumen"}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {previewFile && (
                    <button
                      type="button"
                      className="skl-btn skl-btn-secondary"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.82rem" }}
                      onClick={() => handleDownload(previewFile)}
                    >
                      <Icon name="download" size={15} />
                      Unduh
                    </button>
                  )}
                  <button
                    type="button"
                    className="skl-action-icon-btn"
                    onClick={closePreviewModal}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#1e293b",
                  overflow: "hidden",
                }}
              >
                {loadingPreview ? (
                  <div style={{ color: "#ffffff", textAlign: "center" }}>
                    <div className="spinner-border text-light" role="status" />
                    <p style={{ marginTop: "0.8rem", fontSize: "0.9rem" }}>Membuka dokumen...</p>
                  </div>
                ) : previewUrl ? (
                  previewFile?.mimeType?.includes("image") ? (
                    <img
                      src={previewUrl}
                      alt={previewFile?.namaFile}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <iframe
                      src={previewUrl}
                      title={previewFile?.namaFile}
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  )
                ) : (
                  <div style={{ color: "#ffffff" }}>Tidak dapat menampilkan dokumen</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
