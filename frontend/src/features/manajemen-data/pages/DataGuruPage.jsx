import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import {
  asyncGetGuru,
  asyncDeleteGuru,
  asyncCariGuru,
} from "../states/action";
import manajemenApi from "../api/manajemenApi.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import DetailModal from "../components/DetailModal.jsx";
import RowActionMenu from "../components/RowActionMenu.jsx";
import propsBarisKlik from "../components/barisKlik.js";
import Icon from "../../../components/Icon";
import KotakCari from "../../../components/KotakCari";
import Paginasi from "../components/Paginasi.jsx";
import KonfirmasiHapusMassal, {
  BilahPilihan,
  KotakPilih,
  KotakPilihSemua,
} from "../../../components/HapusMassal";
import "../resources/manajemen.css";

export default function DataGuruPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dibungkus useMemo agar identitasnya stabil saat dipakai sebagai dependensi efek.
  const guruStore = useSelector((s) => s.guru);
  const guru    = useMemo(() => guruStore ?? [], [guruStore]);
  const totalDariServer = useSelector((s) => s.totalGuru);

  const [search,        setSearch]        = useState("");
  const [filterMapel,   setFilterMapel]   = useState("");
  const [offset,        setOffset]        = useState(0);
  const [totalGuru,     setTotalGuru]     = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [deleteModal,   setDeleteModal]   = useState({ open: false, id: null, nama: "" });
  const [detailItem,    setDetailItem]    = useState(null);

  const perPage     = 20;
  const currentPage = Math.floor(offset / perPage) + 1;

  // Saat ada kata kunci atau filter, data diambil lewat endpoint pencarian
  // sehingga seluruh data guru ikut tercakup — bukan hanya halaman aktif.
  const kataKunci = search.trim();
  const modePencarian = Boolean(kataKunci || filterMapel);

  const [opsiMapel, setOpsiMapel] = useState([]);

  // Dinaikkan setelah hapus/impor agar daftar dimuat ulang dengan kueri yang
  // sedang aktif — hasil pencarian tetap bertahan, tidak lompat ke halaman 1.
  const [versiData, setVersiData] = useState(0);
  const muatUlang = () => setVersiData((v) => v + 1);

  const [terpilih, setTerpilih] = useState(() => new Set());
  const [modalMassal, setModalMassal] = useState(false);
  const [menghapusMassal, setMenghapusMassal] = useState(false);

  useEffect(() => {
    manajemenApi.getTotalGuru()
      .then((data) => setTotalGuru(data?.data?.total ?? 0))
      .catch(() => setTotalGuru(0));
  }, [versiData]);

  // Daftar biasa: server yang memotong per halaman.
  useEffect(() => {
    if (modePencarian) return;
    dispatch(asyncGetGuru(offset, perPage));
  }, [dispatch, offset, modePencarian, versiData]);

  // Pencarian dan penyaringan: seluruh hasil diambil sekali, pemotongan
  // halaman dikerjakan di sisi klien.
  useEffect(() => {
    if (!modePencarian) return undefined;
    // Tunggu pengetikan berhenti sejenak supaya tidak memanggil API tiap huruf.
    const timer = setTimeout(() => {
      dispatch(asyncCariGuru({ q: kataKunci, mataPelajaran: filterMapel }));
    }, 350);
    return () => clearTimeout(timer);
  }, [dispatch, modePencarian, kataKunci, filterMapel, versiData]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setOffset(0);
  }, [search, filterMapel]);

  // Pilihan dropdown dikumpulkan dari seluruh data yang pernah dimuat agar
  // tidak ikut menyusut saat hasil pencarian hanya memuat sebagian mapel.
  useEffect(() => {
    setOpsiMapel((prev) => {
      const gabungan = Array.from(
        new Set([...prev, ...guru.map((g) => g.mataPelajaran).filter(Boolean)]),
      ).sort();
      return gabungan.length === prev.length ? prev : gabungan;
    });
  }, [guru]);

  // Pilihan dikosongkan setiap kumpulan data berganti supaya tidak ada baris
  // tak terlihat yang ikut terhapus.
  useEffect(() => {
    setTerpilih(new Set());
  }, [guru]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const res = await manajemenApi.importGuru(file);
      const { imported, skipped } = res.data;
      showSuccessDialog(`Import berhasil! ${imported} data masuk, ${skipped} dilewati.`);
      muatUlang();
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setImportLoading(false);
      e.target.value = "";
    }
  };

  const handleExport = async () => {
    await manajemenApi.exportGuru();
  };

  const handleDeleteClick   = (item) => setDeleteModal({ open: true, id: item.id, nama: item.namaLengkap });
  const handleDeleteCancel  = ()     => setDeleteModal({ open: false, id: null, nama: "" });
  const handleDeleteConfirm = ()     => {
    dispatch(asyncDeleteGuru(deleteModal.id, muatUlang));
    setDeleteModal({ open: false, id: null, nama: "" });
  };

  const mapelList = opsiMapel;

  const totalDitemukan = modePencarian ? guru.length : totalDariServer;
  const filtered  = modePencarian ? guru.slice(offset, offset + perPage) : guru;
  const nomorAwal = offset;

  // ── Pilih banyak baris untuk dihapus sekaligus ────────────────
  const idTampil = useMemo(() => filtered.map((item) => item.id), [filtered]);
  const semuaTerpilih = idTampil.length > 0 && idTampil.every((id) => terpilih.has(id));
  const sebagianTerpilih = terpilih.size > 0 && !semuaTerpilih;

  const togglePilih = (id) =>
    setTerpilih((prev) => {
      const berikutnya = new Set(prev);
      if (berikutnya.has(id)) berikutnya.delete(id);
      else berikutnya.add(id);
      return berikutnya;
    });

  const toggleSemua = () =>
    setTerpilih(semuaTerpilih ? new Set() : new Set(idTampil));

  const guruTerpilih = filtered.filter((item) => terpilih.has(item.id));

  const jalankanHapusMassal = async () => {
    setMenghapusMassal(true);
    try {
      const res = await manajemenApi.hapusGuruMassal(Array.from(terpilih));
      const { dihapus = 0, tidakDitemukan = [] } = res.data || {};
      setModalMassal(false);
      setTerpilih(new Set());
      muatUlang();
      showSuccessDialog(
        tidakDitemukan.length > 0
          ? `${dihapus} guru dihapus. ${tidakDitemukan.length} data sudah tidak ada.`
          : `${dihapus} guru berhasil dihapus.`,
      );
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setMenghapusMassal(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">

        {/* HEADER */}
        <div className="smk-header-area">
          <h1 className="smk-section-title">
            Data Guru <span className="text-primary">SMKN 3 BALIGE</span>
          </h1>
          <div className="smk-stats-row">
            <div className="smk-stat-pill">
              <span className="smk-stat-pill-icon"><Icon name="teacher" size={20} /></span>
              <span className="smk-stat-pill-number">{totalGuru}</span>
            </div>
          </div>
        </div>

        {/* KONTEN */}
        <div className="smk-manajemen-container">
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />

          {/* ACTION BAR */}
          <div className="smk-action-bar">
            <button onClick={() => navigate(adminPath("/data/guru/add"))} className="btn-primary">
              + Tambah Guru
            </button>
            <div className="smk-filters">
              <KotakCari
                nilai={search}
                onUbah={setSearch}
                placeholder="Cari nama guru, NIP, mata pelajaran, atau jabatan..."
                jumlah={filtered.length}
                labelJumlah="guru"
              />
              <select
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                className="input-select"
              >
                <option value="">Mata Pelajaran</option>
                {mapelList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {modePencarian && (
            <div className="ringkasan-filter">
              <span className="ringkasan-filter-jumlah">
                <strong>{totalDitemukan}</strong> guru ditemukan
              </span>
              {kataKunci && <span className="ringkasan-chip">Kata kunci: &quot;{kataKunci}&quot;</span>}
              {filterMapel && <span className="ringkasan-chip">Mata pelajaran: {filterMapel}</span>}
              <button
                type="button"
                className="ringkasan-reset"
                onClick={() => {
                  setSearch("");
                  setFilterMapel("");
                }}
              >
                Hapus semua filter
              </button>
            </div>
          )}

          {/* BILAH PILIHAN */}
          <BilahPilihan
            jumlah={terpilih.size}
            totalTampil={idTampil.length}
            label="guru"
            memproses={menghapusMassal}
            onPilihSemua={() => setTerpilih(new Set(idTampil))}
            onBersihkan={() => setTerpilih(new Set())}
            onHapus={() => setModalMassal(true)}
          />

          {/* TABLE */}
          <div className="table-container">
            <table className="modern-table table-guru">
              <thead>
                <tr>
                  <th className="kolom-pilih">
                    <KotakPilihSemua
                      semua={semuaTerpilih}
                      sebagian={sebagianTerpilih}
                      onUbah={toggleSemua}
                    />
                  </th>
                  <th className="kolom-no">No</th>
                  <th>NIP</th>
                  <th>Nama Lengkap</th>
                  <th className="kolom-teks">Mata Pelajaran</th>
                  <th className="kolom-teks">Jabatan</th>
                  <th>No Telepon</th>
                  <th className="kolom-teks">Anak Wali (Kelas)</th>
                  <th className="kolom-opsional kolom-teks">Alamat</th>
                  <th className="kolom-aksi">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    {...propsBarisKlik(() => setDetailItem(item), `Lihat detail ${item.namaLengkap}`)}
                    className={`baris-klik${terpilih.has(item.id) ? " baris-terpilih" : ""}`}
                  >
                    <td className="kolom-pilih">
                      <KotakPilih
                        dipilih={terpilih.has(item.id)}
                        onUbah={() => togglePilih(item.id)}
                        judul={`Pilih ${item.namaLengkap}`}
                      />
                    </td>
                    <td className="kolom-no">{nomorAwal + index + 1}</td>
                    <td>{item.nip || "-"}</td>
                    <td className="nama">
                      <button className="nama-link" onClick={() => setDetailItem(item)}>
                        {item.namaLengkap}
                      </button>
                    </td>
                    <td className="kolom-teks">{item.mataPelajaran || "-"}</td>
                    <td className="kolom-teks">{item.jabatan || "-"}</td>
                    <td>{item.noTelepon || "-"}</td>
                    <td className="kolom-teks">{item.anakWali || "-"}</td>
                    <td className="kolom-opsional kolom-teks">{item.alamat || "-"}</td>
                    <td className="aksi">
                      <RowActionMenu
                        onDetail={() => setDetailItem(item)}
                        onEdit={() => navigate(adminPath(`/data/guru/edit/${item.id}`))}
                        onDelete={() => handleDeleteClick(item)}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", color: "#aaa", padding: "30px" }}>
                      {modePencarian
                        ? "Tidak ada guru yang cocok dengan pencarian"
                        : "Tidak ada data guru"}
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
              <a href="/template_guru.xlsx" download className="btn-export" style={{ textDecoration: "none" }}>
                <Icon name="book" size={16} /> Template
              </a>
            </div>

            <Paginasi
              halaman={currentPage}
              totalData={totalDitemukan}
              perHalaman={perPage}
              jumlahTampil={filtered.length}
              label="guru"
              onPindah={(n) => setOffset(Math.max(0, (n - 1) * perPage))}
            />
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
        </div>
      </section>

      {/* MODAL DETAIL */}
      {detailItem && (
        <DetailModal
          title={detailItem.namaLengkap}
          subtitle={detailItem.jabatan || "Guru"}
          onClose={() => setDetailItem(null)}
          onEdit={() => navigate(adminPath(`/data/guru/edit/${detailItem.id}`))}
          fields={[
            { label: "NIP", value: detailItem.nip },
            { label: "Nama Lengkap", value: detailItem.namaLengkap },
            { label: "Mata Pelajaran", value: detailItem.mataPelajaran },
            { label: "Jabatan", value: detailItem.jabatan },
            { label: "No Telepon", value: detailItem.noTelepon },
            { label: "Anak Wali (Kelas)", value: detailItem.anakWali },
            { label: "Alamat", value: detailItem.alamat },
          ]}
        />
      )}

      {/* MODAL HAPUS MASSAL */}
      <KonfirmasiHapusMassal
        terbuka={modalMassal}
        jumlah={terpilih.size}
        contoh={guruTerpilih.slice(0, 5).map((g) => `${g.namaLengkap} — ${g.mataPelajaran || "tanpa mapel"}`)}
        label="guru"
        memproses={menghapusMassal}
        onBatal={() => setModalMassal(false)}
        onKonfirmasi={jalankanHapusMassal}
      />

      {/* MODAL HAPUS */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><Icon name="trash" size={26} /></div>
            <h2 className="modal-title">Hapus Guru?</h2>
            <p className="modal-desc">
              Kamu akan menghapus data guru <strong>{deleteModal.nama}</strong>.
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
