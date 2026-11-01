import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import {
  asyncGetSiswa,
  asyncGetStatsSiswa,
  asyncDeleteSiswa,
  asyncCariSiswa,
} from "../states/action";
import manajemenApi from "../api/manajemenApi.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import "../resources/manajemen.css";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import RowActionMenu from "../components/RowActionMenu.jsx";
import propsBarisKlik from "../components/barisKlik.js";
import Icon from "../../../components/Icon";
import KotakCari from "../../../components/KotakCari";
import Paginasi from "../components/Paginasi.jsx";
import PratinjauImport from "../components/PratinjauImport.jsx";
import KonfirmasiHapusMassal, {
  BilahPilihan,
  KotakPilih,
  KotakPilihSemua,
} from "../../../components/HapusMassal";

export default function DataSiswaPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalSiswa = useSelector((s) => s.totalSiswa);
  const bukaDetail = (item) => navigate(adminPath(`/data/siswa/${item.id}`));

  // Dibungkus useMemo agar identitasnya stabil saat dipakai sebagai dependensi efek.
  const siswaStore = useSelector((s) => s.siswa);
  const siswa  = useMemo(() => siswaStore ?? [], [siswaStore]);
  const stats  = useSelector((s) => s.statsSiswa);

  const [search,        setSearch]        = useState("");
  const [filterKelas,   setFilterKelas]   = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [offset,        setOffset]        = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  // Berkas ditahan di sini sampai admin menyetujui pratinjaunya.
  const [berkasImport, setBerkasImport] = useState(null);
  const [pratinjau, setPratinjau] = useState(null);
  const [memuatPratinjau, setMemuatPratinjau] = useState(false);
  const [deleteModal,   setDeleteModal]   = useState({ open: false, id: null, nama: "" });

  const perPage     = 50;
  const currentPage = Math.floor(offset / perPage) + 1;

  // Saat ada kata kunci atau filter, data diambil lewat endpoint pencarian
  // sehingga seluruh data siswa ikut tercakup — bukan hanya halaman aktif.
  const kataKunci = search.trim();
  const modePencarian = Boolean(kataKunci || filterKelas || filterJurusan);

  const [opsiKelas, setOpsiKelas] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);

  // Dinaikkan setelah hapus/impor agar daftar dimuat ulang dengan kueri yang
  // sedang aktif — hasil pencarian tetap bertahan, tidak lompat ke halaman 1.
  const [versiData, setVersiData] = useState(0);
  const muatUlang = () => setVersiData((v) => v + 1);

  const [terpilih, setTerpilih] = useState(() => new Set());
  const [modalMassal, setModalMassal] = useState(false);
  const [menghapusMassal, setMenghapusMassal] = useState(false);

  useEffect(() => {
    dispatch(asyncGetStatsSiswa());
  }, [dispatch]);

  // Daftar biasa: server yang memotong per halaman.
  useEffect(() => {
    if (modePencarian) return;
    dispatch(asyncGetSiswa(offset, perPage));
  }, [dispatch, offset, modePencarian, versiData]);

  // Pencarian dan penyaringan: seluruh hasil diambil sekali, pemotongan
  // halaman dikerjakan di sisi klien supaya pindah halaman tidak memanggil
  // API berulang kali.
  useEffect(() => {
    if (!modePencarian) return undefined;
    // Tunggu pengetikan berhenti sejenak supaya tidak memanggil API tiap huruf.
    const timer = setTimeout(() => {
      dispatch(
        asyncCariSiswa({ q: kataKunci, kelas: filterKelas, jurusan: filterJurusan }),
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [dispatch, modePencarian, kataKunci, filterKelas, filterJurusan, versiData]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setOffset(0);
  }, [search, filterKelas, filterJurusan]);

  // Pilihan dropdown dikumpulkan dari seluruh data yang pernah dimuat agar
  // tidak ikut menyusut saat hasil pencarian hanya memuat sebagian kelas.
  useEffect(() => {
    const gabung = (sebelumnya, nilaiBaru) => {
      const gabungan = Array.from(new Set([...sebelumnya, ...nilaiBaru])).sort();
      return gabungan.length === sebelumnya.length ? sebelumnya : gabungan;
    };
    setOpsiKelas((prev) => gabung(prev, siswa.map((s) => s.kelas).filter(Boolean)));
    setOpsiJurusan((prev) => gabung(prev, siswa.map((s) => s.jurusan).filter(Boolean)));
  }, [siswa]);

  // Pilihan dikosongkan setiap kumpulan data berganti supaya tidak ada baris
  // tak terlihat yang ikut terhapus.
  useEffect(() => {
    setTerpilih(new Set());
  }, [siswa]);

  // ── Handlers ──────────────────────────────────────────────────
  // Memilih berkas hanya membaca isinya; penyimpanan menunggu persetujuan.
  const handleImport = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    setBerkasImport(file);
    setPratinjau(null);
    setMemuatPratinjau(true);
    try {
      const res = await manajemenApi.pratinjauImportSiswa(file);
      setPratinjau(res.data);
    } catch (err) {
      showErrorDialog(err.message);
      setBerkasImport(null);
    } finally {
      setMemuatPratinjau(false);
    }
  };

  const batalkanImport = () => {
    setBerkasImport(null);
    setPratinjau(null);
  };

  const setujuiImport = async () => {
    if (!berkasImport) return;
    setImportLoading(true);
    try {
      const res = await manajemenApi.importSiswa(berkasImport);
      showSuccessDialog(res.message || "Import selesai.");
      batalkanImport();
      muatUlang();
      dispatch(asyncGetStatsSiswa());
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    await manajemenApi.exportSiswa({ search });
  };


  const handleDeleteClick   = (item) => setDeleteModal({ open: true, id: item.id, nama: item.namaLengkap });
  const handleDeleteCancel  = ()     => setDeleteModal({ open: false, id: null, nama: "" });
  const handleDeleteConfirm = ()     => {
    dispatch(asyncDeleteSiswa(deleteModal.id, muatUlang));
    setDeleteModal({ open: false, id: null, nama: "" });
  };

  const kelasList   = opsiKelas;
  const jurusanList = opsiJurusan;

  // Saat menyaring, seluruh hasil sudah ada di memori; saat tidak, isi `siswa`
  // memang sudah sepotong halaman dari server.
  const totalDitemukan = modePencarian ? siswa.length : totalSiswa;
  const filtered    = modePencarian ? siswa.slice(offset, offset + perPage) : siswa;
  const nomorAwal   = offset;

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

  const siswaTerpilih = filtered.filter((item) => terpilih.has(item.id));

  const jalankanHapusMassal = async () => {
    setMenghapusMassal(true);
    try {
      const res = await manajemenApi.hapusSiswaMassal(Array.from(terpilih));
      const { dihapus = 0, tidakDitemukan = [] } = res.data || {};
      setModalMassal(false);
      setTerpilih(new Set());
      muatUlang();
      dispatch(asyncGetStatsSiswa());
      showSuccessDialog(
        tidakDitemukan.length > 0
          ? `${dihapus} siswa dihapus. ${tidakDitemukan.length} data sudah tidak ada.`
          : `${dihapus} siswa berhasil dihapus.`,
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
              <KotakCari
                nilai={search}
                onUbah={setSearch}
                placeholder="Cari nama, NIS, atau NISN..."
                jumlah={filtered.length}
                labelJumlah="siswa"
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

          {modePencarian && (
            <div className="ringkasan-filter">
              <span className="ringkasan-filter-jumlah">
                <strong>{totalDitemukan}</strong> siswa ditemukan
              </span>
              {kataKunci && <span className="ringkasan-chip">Kata kunci: &quot;{kataKunci}&quot;</span>}
              {filterKelas && <span className="ringkasan-chip">Kelas: {filterKelas}</span>}
              {filterJurusan && <span className="ringkasan-chip">Jurusan: {filterJurusan}</span>}
              <button
                type="button"
                className="ringkasan-reset"
                onClick={() => {
                  setSearch("");
                  setFilterKelas("");
                  setFilterJurusan("");
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
            label="siswa"
            memproses={menghapusMassal}
            onPilihSemua={() => setTerpilih(new Set(idTampil))}
            onBersihkan={() => setTerpilih(new Set())}
            onHapus={() => setModalMassal(true)}
          />

          {/* TABLE */}
          <div className="table-container">
            <table className="modern-table table-siswa">
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
                  <th>NISN</th>
                  <th>NIS</th>
                  <th>Nama Lengkap</th>
                  <th>Kelas</th>
                  <th className="kolom-teks">Jurusan</th>
                  <th className="kolom-opsional">Tanggal Lahir</th>
                  <th className="kolom-opsional kolom-teks">Alamat</th>
                  <th>No WA Ortu</th>
                  <th>Status</th>
                  <th className="kolom-aksi">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    {...propsBarisKlik(() => bukaDetail(item), `Lihat detail ${item.namaLengkap}`)}
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
                    <td>{item.nisn || "-"}</td>
                    <td>{item.nis || "-"}</td>
                    <td className="nama">
                      <button className="nama-link" onClick={() => bukaDetail(item)}>
                        {item.namaLengkap}
                      </button>
                    </td>
                    <td>{item.kelas || "-"}</td>
                    <td className="kolom-teks">{item.jurusan || "-"}</td>
                    <td className="kolom-opsional">{item.tanggalLahir || "-"}</td>
                    <td className="kolom-opsional kolom-teks">{item.alamat || "-"}</td>
                    <td>{item.noWaOrtu || "-"}</td>
                    <td>
                      <span className={`badge ${item.status === "lulus" ? "lulus" : "aktif"}`}>
                        {item.status === "lulus" ? "Lulus" : "Aktif"}
                      </span>
                    </td>
                    <td className="aksi">
                      <RowActionMenu
                        onDetail={() => bukaDetail(item)}
                        onEdit={() => navigate(adminPath(`/data/siswa/edit/${item.id}`))}
                        onDelete={() => handleDeleteClick(item)}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} style={{ textAlign: "center", color: "#aaa", padding: "30px" }}>
                      {modePencarian
                        ? "Tidak ada siswa yang cocok dengan pencarian"
                        : "Tidak ada data siswa"}
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

            <Paginasi
              halaman={currentPage}
              totalData={totalDitemukan}
              perHalaman={perPage}
              jumlahTampil={filtered.length}
              label="siswa"
              onPindah={(n) => setOffset(Math.max(0, (n - 1) * perPage))}
            />
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
        </div>
      </section>

      <PratinjauImport
        terbuka={Boolean(berkasImport)}
        namaBerkas={berkasImport?.name || ""}
        memuat={memuatPratinjau}
        memproses={importLoading}
        hasil={pratinjau}
        label="siswa"
        kolom={[
          { kunci: "nisn", judul: "NISN" },
          { kunci: "nis", judul: "NIS" },
          { kunci: "namaLengkap", judul: "Nama Lengkap" },
          { kunci: "rombel", judul: "Rombel" },
          { kunci: "kelas", judul: "Kelas" },
          { kunci: "jurusan", judul: "Jurusan" },
          { kunci: "tanggalLahir", judul: "Tanggal Lahir" },
          { kunci: "alamat", judul: "Alamat" },
        ]}
        onBatal={batalkanImport}
        onKonfirmasi={setujuiImport}
      />

      {/* MODAL HAPUS MASSAL */}
      <KonfirmasiHapusMassal
        terbuka={modalMassal}
        jumlah={terpilih.size}
        contoh={siswaTerpilih.slice(0, 5).map((s) => `${s.namaLengkap} — ${s.kelas || "tanpa kelas"}`)}
        label="siswa"
        memproses={menghapusMassal}
        onBatal={() => setModalMassal(false)}
        onKonfirmasi={jalankanHapusMassal}
      />

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
