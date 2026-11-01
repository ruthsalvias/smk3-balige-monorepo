import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import AdminLayout from "../layouts/AdminLayout";
import { AdminCard, AdminTable, AdminModal } from "../components/AdminComponents";
import RowActionMenu from "../../manajemen-data/components/RowActionMenu";
import KonfirmasiHapusMassal, {
  BilahPilihan,
  KotakPilih,
  KotakPilihSemua,
} from "../../../components/HapusMassal";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import manajemenApi from "../../manajemen-data/api/manajemenApi";
import { useAuth } from "../../auth/context/AuthContext";
import {
  buatAkun,
  buatAkunSiswaMassal,
  getDaftarAkun,
  hapusAkun,
  hapusAkunMassal,
  resetPasswordAkun,
  ubahStatusAkun,
} from "../api/akunApi";

const ROLE_PILIHAN = [
  { nilai: "admin", label: "Admin" },
  { nilai: "guru", label: "Guru" },
  { nilai: "siswa", label: "Siswa" },
];

function pesanError(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

function tanggalSingkat(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminAkunPage() {
  const { isAuth, user, roles = [] } = useAuth();
  const bolehAkses = isAuth && roles.includes("master_admin");

  const [akun, setAkun] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cari, setCari] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const [modalBuat, setModalBuat] = useState(false);
  const [modalMassal, setModalMassal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("siswa");
  const [password, setPassword] = useState("");
  const [nis, setNis] = useState("");

  const [passwordMassal, setPasswordMassal] = useState("");
  const [semuaSiswa, setSemuaSiswa] = useState([]);
  const [memuatSiswa, setMemuatSiswa] = useState(false);
  const [opsiKelas, setOpsiKelas] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");

  const [terpilih, setTerpilih] = useState(() => new Set());
  const [modalHapusMassal, setModalHapusMassal] = useState(false);
  const [menghapusMassal, setMenghapusMassal] = useState(false);

  // Tanpa penjaga ini, halaman ikut memanggil API saat sesi sudah hilang (mis. setelah logout) dan memunculkan dialog 401.
  useEffect(() => {
    if (!bolehAkses) return;
    muatAkun();
  }, [bolehAkses]);

  const muatAkun = async () => {
    setLoading(true);
    try {
      setAkun(await getDaftarAkun());
      // Pilihan dikosongkan supaya tidak menyisakan akun yang sudah tidak ada.
      setTerpilih(new Set());
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal memuat daftar akun"));
    } finally {
      setLoading(false);
    }
  };

  const terfilter = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return akun.filter((a) => {
      const cocokRole = !filterRole || a.roles.includes(filterRole);
      const cocokKunci =
        !kunci ||
        a.username.toLowerCase().includes(kunci) ||
        a.nama.toLowerCase().includes(kunci);
      return cocokRole && cocokKunci;
    });
  }, [akun, cari, filterRole]);

  // ── Pilih banyak akun untuk dihapus sekaligus ─────────────────
  // Akun master admin dan akun yang sedang dipakai tidak bisa dipilih.
  const bolehDipilih = (item) =>
    !item.roles?.includes("master_admin") && item.id !== user?.id;

  const idBisaDipilih = useMemo(
    () => terfilter.filter(bolehDipilih).map((a) => a.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [terfilter, user?.id],
  );
  const semuaTerpilih =
    idBisaDipilih.length > 0 && idBisaDipilih.every((id) => terpilih.has(id));
  const sebagianTerpilih = terpilih.size > 0 && !semuaTerpilih;

  const togglePilih = (id) =>
    setTerpilih((prev) => {
      const berikutnya = new Set(prev);
      if (berikutnya.has(id)) berikutnya.delete(id);
      else berikutnya.add(id);
      return berikutnya;
    });

  const toggleSemua = () =>
    setTerpilih(semuaTerpilih ? new Set() : new Set(idBisaDipilih));

  const akunTerpilih = terfilter.filter((a) => terpilih.has(a.id));

  const jalankanHapusMassal = async () => {
    setMenghapusMassal(true);
    try {
      const hasil = await hapusAkunMassal(Array.from(terpilih));
      const { dihapus = [], dilewati = [] } = hasil || {};
      setModalHapusMassal(false);
      setTerpilih(new Set());
      await muatAkun();
      showSuccessDialog(
        dilewati.length > 0
          ? `${dihapus.length} akun dihapus, ${dilewati.length} dilewati (${dilewati
              .slice(0, 3)
              .map((d) => `${d.username}: ${d.alasan}`)
              .join("; ")}).`
          : `${dihapus.length} akun berhasil dihapus.`,
      );
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal menghapus akun terpilih"));
    } finally {
      setMenghapusMassal(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setNama("");
    setRole("siswa");
    setPassword("");
    setNis("");
  };

  const simpanAkun = async () => {
    if (!username.trim() || !nama.trim() || password.length < 8) {
      showErrorDialog("Username, nama, dan password minimal 8 karakter wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      await buatAkun({
        username: username.trim(),
        nama: nama.trim(),
        role,
        password,
        nis: role === "siswa" ? nis.trim() || username.trim() : "",
      });
      setModalBuat(false);
      resetForm();
      await muatAkun();
      showSuccessDialog("Akun berhasil dibuat");
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal membuat akun"));
    } finally {
      setSubmitting(false);
    }
  };

  const bukaModalMassal = async () => {
    setModalMassal(true);
    setMemuatSiswa(true);
    setFilterKelas("");
    setFilterJurusan("");
    try {
      // Endpoint ringkas dipakai karena /siswa biasa dibatasi dan diam-diam
      // memotong daftar saat siswanya lebih banyak dari batas itu.
      const [resSiswa, resOpsi] = await Promise.all([
        manajemenApi.getSiswaRingkas(),
        manajemenApi.getOpsiFilterSiswa(),
      ]);
      const daftar = resSiswa?.data?.siswa || [];
      setSemuaSiswa(
        daftar.map((s) => ({
          id: s.id,
          nisn: String(s.nisn || "").trim(),
          nis: String(s.nis || "").trim(),
          nama: s.namaLengkap || "",
          kelas: String(s.kelas || "").trim(),
          jurusan: String(s.jurusan || "").trim(),
        })),
      );
      setOpsiKelas(resOpsi?.data?.kelas || []);
      setOpsiJurusan(resOpsi?.data?.jurusan || []);
    } catch (err) {
      showErrorDialog(err.message || "Gagal memuat data siswa");
      setSemuaSiswa([]);
      setOpsiKelas([]);
      setOpsiJurusan([]);
    } finally {
      setMemuatSiswa(false);
    }
  };

  // Username akun siswa memakai NISN; data Dapodik jarang mengisi NIS.
  const usernameAda = useMemo(
    () => new Set(akun.map((a) => String(a.username || "").toLowerCase())),
    [akun],
  );

  const siswaTersaring = useMemo(
    () =>
      semuaSiswa.filter(
        (s) =>
          (!filterKelas || s.kelas === filterKelas) &&
          (!filterJurusan || s.jurusan === filterJurusan),
      ),
    [semuaSiswa, filterKelas, filterJurusan],
  );

  const tanpaNisn = useMemo(() => siswaTersaring.filter((s) => !s.nisn), [siswaTersaring]);

  const sudahPunyaAkun = useMemo(
    () => siswaTersaring.filter((s) => s.nisn && usernameAda.has(s.nisn.toLowerCase())),
    [siswaTersaring, usernameAda],
  );

  const siswaTanpaAkun = useMemo(
    () =>
      siswaTersaring
        .filter((s) => s.nisn && !usernameAda.has(s.nisn.toLowerCase()))
        .map((s) => ({ nis: s.nisn, nama: s.nama, kelas: s.kelas, jurusan: s.jurusan })),
    [siswaTersaring, usernameAda],
  );

  const prosesMassal = async () => {
    if (passwordMassal.length < 8) {
      showErrorDialog("Password awal minimal 8 karakter");
      return;
    }
    if (!siswaTanpaAkun.length) {
      showErrorDialog(
        tanpaNisn.length > 0
          ? `Tidak ada siswa yang bisa dibuatkan akun. ${tanpaNisn.length} siswa pada pilihan ini belum punya NISN.`
          : "Tidak ada siswa yang perlu dibuatkan akun pada pilihan ini",
      );
      return;
    }
    if (siswaTanpaAkun.length > 500) {
      showErrorDialog(
        `${siswaTanpaAkun.length} siswa terlalu banyak untuk sekali proses (maksimal 500). ` +
          "Saring dulu per kelas atau per jurusan.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await buatAkunSiswaMassal({
        password: passwordMassal,
        siswa: siswaTanpaAkun,
      });
      setModalMassal(false);
      setPasswordMassal("");
      await muatAkun();
      showSuccessDialog(res.message || "Akun siswa berhasil dibuat");
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal membuat akun siswa"));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = async (item) => {
    const { value: baru } = await Swal.fire({
      title: `Reset password ${item.username}`,
      input: "text",
      inputLabel: "Password baru (minimal 8 karakter)",
      inputValue: "",
      showCancelButton: true,
      confirmButtonText: "Reset",
      cancelButtonText: "Batal",
      inputValidator: (v) => (!v || v.length < 8 ? "Minimal 8 karakter" : undefined),
    });
    if (!baru) return;
    try {
      await resetPasswordAkun(item.id, baru);
      await muatAkun();
      showSuccessDialog(`Password ${item.username} berhasil direset`);
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal mereset password"));
    }
  };

  const gantiStatus = async (item) => {
    try {
      await ubahStatusAkun(item.id, !item.aktif);
      await muatAkun();
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal mengubah status akun"));
    }
  };

  const hapus = async (item) => {
    const konfirmasi = await showConfirmDialog(`Hapus akun ${item.username}?`);
    if (!konfirmasi.isConfirmed) return;
    try {
      await hapusAkun(item.id);
      await muatAkun();
      showSuccessDialog("Akun dihapus");
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal menghapus akun"));
    }
  };

  return (
    <AdminLayout
      title="Kelola Akun"
      subtitle="Membuat dan mengatur akun admin, guru, dan siswa"
      butuhMasterAdmin
    >
      <AdminCard
        title="Daftar Akun"
        subtitle={`${terfilter.length} akun ditampilkan`}
        onAdd={() => setModalBuat(true)}
        addLabel="+ Buat Akun"
      >
        <div className="smk-akun-toolbar">
          <input
            className="smk-akun-input"
            placeholder="Cari username atau nama..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
          <select
            className="smk-akun-input"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Semua role</option>
            {ROLE_PILIHAN.map((r) => (
              <option key={r.nilai} value={r.nilai}>
                {r.label}
              </option>
            ))}
          </select>
          <button className="smk-btn-primary smk-admin-btn-sm" onClick={bukaModalMassal}>
            Buat Akun Siswa Massal
          </button>
        </div>

        <BilahPilihan
          jumlah={terpilih.size}
          totalTampil={idBisaDipilih.length}
          label="akun"
          memproses={menghapusMassal}
          onPilihSemua={() => setTerpilih(new Set(idBisaDipilih))}
          onBersihkan={() => setTerpilih(new Set())}
          onHapus={() => setModalHapusMassal(true)}
        />

        <AdminTable
          columns={[
            {
              kunci: "pilih",
              isi: (
                <KotakPilihSemua
                  semua={semuaTerpilih}
                  sebagian={sebagianTerpilih}
                  onUbah={toggleSemua}
                />
              ),
            },
            "Username",
            "Nama",
            "Role",
            "Status Password",
            "Dibuat",
            "Status",
            "Aksi",
          ]}
          loading={loading}
          empty={!loading && terfilter.length === 0}
        >
          {terfilter.map((item) => (
            <tr key={item.id}>
              <td>
                {bolehDipilih(item) ? (
                  <KotakPilih
                    dipilih={terpilih.has(item.id)}
                    onUbah={() => togglePilih(item.id)}
                    judul={`Pilih akun ${item.username}`}
                  />
                ) : (
                  <span title="Akun ini tidak bisa dihapus" style={{ color: "#cbd5e1" }}>—</span>
                )}
              </td>
              <td>{item.username}</td>
              <td>{item.nama}</td>
              <td>{item.roles.join(", ") || "-"}</td>
              <td>
                {item.passwordDiubahSendiri ? (
                  <span className="smk-admin-badge smk-admin-badge-blue">
                    Diubah sendiri {tanggalSingkat(item.passwordDiubahPada)}
                  </span>
                ) : (
                  <span className="smk-admin-badge smk-admin-badge-bronze">
                    Masih password dari admin
                  </span>
                )}
              </td>
              <td>{tanggalSingkat(item.dibuatPada)}</td>
              <td>{item.aktif ? "Aktif" : "Nonaktif"}</td>
              <td>
                <div className="smk-admin-actions">
                  <RowActionMenu
                    items={[
                      { label: "Reset Password", icon: "settings", onClick: () => reset(item) },
                      {
                        label: item.aktif ? "Nonaktifkan" : "Aktifkan",
                        icon: "power",
                        onClick: () => gantiStatus(item),
                      },
                      { pemisah: true },
                      { label: "Hapus", icon: "trash", onClick: () => hapus(item), bahaya: true },
                    ]}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <KonfirmasiHapusMassal
        terbuka={modalHapusMassal}
        jumlah={terpilih.size}
        contoh={akunTerpilih.slice(0, 5).map((a) => `${a.username} — ${a.nama}`)}
        label="akun"
        memproses={menghapusMassal}
        onBatal={() => setModalHapusMassal(false)}
        onKonfirmasi={jalankanHapusMassal}
      />

      <AdminModal
        open={modalBuat}
        onClose={() => setModalBuat(false)}
        title="Buat Akun Baru"
        onSubmit={simpanAkun}
        submitting={submitting}
      >
        <div className="smk-form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_PILIHAN.map((r) => (
              <option key={r.nilai} value={r.nilai}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="smk-form-group">
          <label>Username {role === "siswa" && "(gunakan NIS)"}</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="smk-form-group">
          <label>Nama Lengkap</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} />
        </div>
        {role === "siswa" && (
          <div className="smk-form-group">
            <label>NIS (opsional, default sama dengan username)</label>
            <input value={nis} onChange={(e) => setNis(e.target.value)} />
          </div>
        )}
        <div className="smk-form-group">
          <label>Password Awal (minimal 8 karakter)</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </AdminModal>

      <AdminModal
        open={modalMassal}
        onClose={() => setModalMassal(false)}
        title="Buat Akun Siswa Massal"
        onSubmit={prosesMassal}
        submitting={submitting}
      >
        <p className="smk-admin-card-sub">
          Username setiap akun memakai NISN siswa. Saring per kelas atau jurusan bila ingin
          memberi password awal yang berbeda tiap rombel. Password di bawah berlaku untuk
          siswa yang sedang tampil saja, dan bisa diganti sendiri setelah login.
        </p>

        <div className="smk-form-row">
          <div className="smk-form-group">
            <label htmlFor="massal-kelas">Kelas</label>
            <select
              id="massal-kelas"
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
            >
              <option value="">Semua kelas</option>
              {opsiKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div className="smk-form-group">
            <label htmlFor="massal-jurusan">Jurusan</label>
            <select
              id="massal-jurusan"
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
            >
              <option value="">Semua jurusan</option>
              {opsiJurusan.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="smk-form-group">
          <label htmlFor="massal-password">Password Awal (minimal 8 karakter)</label>
          <input
            id="massal-password"
            value={passwordMassal}
            onChange={(e) => setPasswordMassal(e.target.value)}
          />
        </div>

        <div className="smk-form-group">
          <label>
            Akan dibuatkan akun:{" "}
            {memuatSiswa ? "memuat..." : `${siswaTanpaAkun.length} siswa`}
          </label>

          {!memuatSiswa && (sudahPunyaAkun.length > 0 || tanpaNisn.length > 0) && (
            <p className="smk-admin-card-sub" style={{ margin: "0 0 8px" }}>
              {sudahPunyaAkun.length > 0 && `${sudahPunyaAkun.length} sudah punya akun. `}
              {tanpaNisn.length > 0 && `${tanpaNisn.length} dilewati karena NISN belum diisi.`}
            </p>
          )}

          <div className="smk-akun-preview">
            {siswaTanpaAkun.length === 0 && !memuatSiswa && <div>Tidak ada siswa pada pilihan ini.</div>}
            {siswaTanpaAkun.slice(0, 50).map((s) => (
              <div key={s.nis}>
                {s.nis} — {s.nama}
                {s.kelas || s.jurusan ? ` (${[s.kelas, s.jurusan].filter(Boolean).join(" ")})` : ""}
              </div>
            ))}
            {siswaTanpaAkun.length > 50 && <div>dan {siswaTanpaAkun.length - 50} lainnya...</div>}
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
