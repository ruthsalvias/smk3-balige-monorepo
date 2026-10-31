import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import {
  asyncGetSiswa,
  asyncGetStatsSiswa,
  asyncDeleteSiswa,
} from "../states/action";
import manajemenApi from "../api/manajemenApi.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import "../resources/manajemen.css";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import DetailModal from "../components/DetailModal.jsx";
import RowActionMenu from "../components/RowActionMenu.jsx";
import Icon from "../../../components/Icon";
import DaftarDokumen from "../../../components/DaftarDokumen";
import {
  JENIS_DOKUMEN,
  kelompokkanDokumen,
  lihatDokumenSiswa,
  unduhDokumenSiswa,
} from "../../akun/api/dokumenApi";

export default function DataSiswaPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const siswa  = useSelector((s) => s.siswa)        ?? [];
  const stats  = useSelector((s) => s.statsSiswa);
  const hasMore = useSelector((s) => s.hasMoreSiswa);

  const [search,        setSearch]        = useState("");
  const [filterKelas,   setFilterKelas]   = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [offset,        setOffset]        = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [deleteModal,   setDeleteModal]   = useState({ open: false, id: null, nama: "" });
  const [detailItem,    setDetailItem]    = useState(null);

  const perPage     = 20;
  const currentPage = Math.floor(offset / perPage) + 1;

  // Fetch data saat offset berubah
  useEffect(() => {
    dispatch(asyncGetSiswa(offset, perPage));
    dispatch(asyncGetStatsSiswa());
  }, [dispatch, offset]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setOffset(0);
  }, [search, filterKelas, filterJurusan]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const res = await manajemenApi.importSiswa(file);
      const { imported, skipped } = res.data;
      showSuccessDialog(`Import berhasil! ${imported} data masuk, ${skipped} dilewati.`);
      dispatch(asyncGetSiswa(offset, perPage));
      dispatch(asyncGetStatsSiswa());
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setImportLoading(false);
      e.target.value = "";
    }
  };

  const handleExport = async () => {
    await manajemenApi.exportSiswa({ search });
  };

  const lihatDokumen = async (siswaId, dok) => {
    try {
      await lihatDokumenSiswa(siswaId, dok.id);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const unduhDokumen = async (siswaId, dok) => {
    try {
      await unduhDokumenSiswa(siswaId, dok.id, dok.nama);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const handleDeleteClick   = (item) => setDeleteModal({ open: true, id: item.id, nama: item.namaLengkap });
  const handleDeleteCancel  = ()     => setDeleteModal({ open: false, id: null, nama: "" });
  const handleDeleteConfirm = ()     => {
    dispatch(asyncDeleteSiswa(deleteModal.id));
    setDeleteModal({ open: false, id: null, nama: "" });
  };

  // ── Filter lokal (dari data yang sudah di-fetch) ───────────────
  const kelasList   = [...new Set(siswa.map((s) => s.kelas).filter(Boolean))];
  const jurusanList = [...new Set(siswa.map((s) => s.jurusan).filter(Boolean))];

  const filtered = siswa.filter((item) => {
    const matchSearch  = item.namaLengkap?.toLowerCase().includes(search.toLowerCase());
    const matchKelas   = filterKelas   ? item.kelas   === filterKelas   : true;
    const matchJurusan = filterJurusan ? item.jurusan === filterJurusan : true;
    return matchSearch && matchKelas && matchJurusan;
  });

  // ── Render ────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">

        {/* HEADER */}
        <div className="smk-header-area">
          <h1 className="smk-section-title">
            Data Siswa <span className="text-primary">SMKN 3 BALIGE</span>
          </h1>
          <div className="smk-stats-row">
            <div className="smk-stat-pill">
              <span className="smk-stat-pill-icon"><Icon name="students" size={20} /></span>
              <span className="smk-stat-pill-number">{stats?.total || 0}</span>
            </div>
            <div className="smk-stat-pill">
              <span className="smk-stat-pill-icon"><Icon name="shield" size={20} /></span>
              <span className="smk-stat-pill-number">{stats?.aktif || 0}</span>
            </div>
            <div className="smk-stat-pill">
              <span className="smk-stat-pill-icon"><Icon name="graduation" size={20} /></span>
              <span className="smk-stat-pill-number">{stats?.lulus || 0}</span>
            </div>
          </div>
        </div>

        {/* KONTEN */}
        <div className="smk-manajemen-container">
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />

          {/* ACTION BAR */}
          <div className="smk-action-bar">
            <button onClick={() => navigate(adminPath("/data/siswa/add"))} className="btn-primary">
              + Tambah Siswa
            </button>
            <div className="smk-filters">
              <input
                type="text"
                placeholder="cari....."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-search"
              />
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="input-select"
              >
                <option value="">Kelas</option>
                {kelasList.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <select
                value={filterJurusan}
                onChange={(e) => setFilterJurusan(e.target.value)}
                className="input-select"
              >
                <option value="">Jurusan</option>
                {jurusanList.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <table className="modern-table table-siswa">
              <thead>
                <tr>
                  <th>No</th>
                  <th>NISN</th>
                  <th>NIS</th>
                  <th>Nama Lengkap</th>
                  <th>Kelas</th>
                  <th>Jurusan</th>
                  <th>Tanggal Lahir</th>
                  <th>Alamat</th>
                  <th>No WA Ortu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={item.id}>
                    <td>{offset + index + 1}</td>
                    <td>{item.nisn || "-"}</td>
                    <td>{item.nis || "-"}</td>
                    <td className="nama">
                      <button className="nama-link" onClick={() => setDetailItem(item)}>
                        {item.namaLengkap}
                      </button>
                    </td>
                    <td>{item.kelas || "-"}</td>
                    <td>{item.jurusan || "-"}</td>
                    <td>{item.tanggalLahir || "-"}</td>
                    <td>{item.alamat || "-"}</td>
                    <td>{item.noWaOrtu || "-"}</td>
                    <td>
                      <span className={`badge ${item.status === "lulus" ? "lulus" : "aktif"}`}>
                        {item.status === "lulus" ? "Lulus" : "Aktif"}
                      </span>
                    </td>
                    <td className="aksi">
                      <RowActionMenu
                        onDetail={() => setDetailItem(item)}
                        onEdit={() => navigate(adminPath(`/data/siswa/edit/${item.id}`))}
                        onDelete={() => handleDeleteClick(item)}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", color: "#aaa", padding: "30px" }}>
                      Tidak ada data siswa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="table-footer">
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleExport} className="btn-export">
                <Icon name="scroll" size={16} /> Export
              </button>
              <label className="btn-export" style={{ cursor: "pointer" }}>
                {importLoading ? "Mengimpor..." : <><Icon name="upload" size={16} /> Import Excel</>}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
              </label>
              <a href="/template_siswa.xlsx" download className="btn-export" style={{ textDecoration: "none" }}>
                <Icon name="book" size={16} /> Template
              </a>
            </div>

            <div className="pagination">
              <button
                onClick={() => setOffset((prev) => Math.max(0, prev - perPage))}
                disabled={offset === 0}
                className="pagination-btn"
              >
                ‹ Prev
              </button>
              <span className="pagination-btn active">{currentPage}</span>
              <button
                onClick={() => setOffset((prev) => prev + perPage)}
                disabled={!hasMore}
                className="pagination-btn"
              >
                Next ›
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
        </div>
      </section>

      {/* MODAL DETAIL */}
      {detailItem && (
        <DetailModal
          title={detailItem.namaLengkap}
          subtitle={`${detailItem.kelas || "-"} · ${detailItem.jurusan || "-"}`}
          onClose={() => setDetailItem(null)}
          onEdit={() => navigate(adminPath(`/data/siswa/edit/${detailItem.id}`))}
          fields={[
            { label: "NISN", value: detailItem.nisn },
            { label: "NIS", value: detailItem.nis },
            { label: "Nama Lengkap", value: detailItem.namaLengkap },
            { label: "Kelas", value: detailItem.kelas },
            { label: "Jurusan", value: detailItem.jurusan },
            { label: "Tanggal Lahir", value: detailItem.tanggalLahir },
            { label: "Alamat", value: detailItem.alamat },
            { label: "No WA Orang Tua", value: detailItem.noWaOrtu },
            { label: "Status", value: detailItem.status === "lulus" ? "Lulus" : "Aktif" },
            ...JENIS_DOKUMEN.map((d) => ({
              label: d.label,
              value: (
                <DaftarDokumen
                  dokumen={kelompokkanDokumen(detailItem)[d.nilai]}
                  onLihat={(dok) => lihatDokumen(detailItem.id, dok)}
                  onUnduh={(dok) => unduhDokumen(detailItem.id, dok)}
                />
              ),
            })),
          ]}
        />
      )}

      {/* MODAL HAPUS */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><Icon name="trash" size={26} /></div>
            <h2 className="modal-title">Hapus Siswa?</h2>
            <p className="modal-desc">
              Kamu akan menghapus data siswa <strong>{deleteModal.nama}</strong>.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions">
              <button onClick={handleDeleteCancel} className="btn-cancel">Batal</button>
              <button onClick={handleDeleteConfirm} className="btn-delete-confirm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
