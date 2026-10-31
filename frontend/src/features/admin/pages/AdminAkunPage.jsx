import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import AdminLayout from "../layouts/AdminLayout";
import { AdminCard, AdminTable, AdminModal } from "../components/AdminComponents";
import RowActionMenu from "../../manajemen-data/components/RowActionMenu";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import apiGateway from "../../../config/axios";
import { useAuth } from "../../auth/context/AuthContext";
import {
  buatAkun,
  buatAkunSiswaMassal,
  getDaftarAkun,
  hapusAkun,
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
  const { isAuth, roles = [] } = useAuth();
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
  const [siswaTanpaAkun, setSiswaTanpaAkun] = useState([]);
  const [memuatSiswa, setMemuatSiswa] = useState(false);

  // Tanpa penjaga ini, halaman ikut memanggil API saat sesi sudah hilang (mis. setelah logout) dan memunculkan dialog 401.
  useEffect(() => {
    if (!bolehAkses) return;
    muatAkun();
  }, [bolehAkses]);

  const muatAkun = async () => {
    setLoading(true);
    try {
      setAkun(await getDaftarAkun());
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
    try {
      const res = await apiGateway.get("/management/siswa?limit=1000&offset=0");
      const isi = res.data?.data;
      const daftar = Array.isArray(isi) ? isi : isi?.siswa || isi?.items || [];
      const usernameAda = new Set(akun.map((a) => a.username));
      setSiswaTanpaAkun(
        daftar
          .filter((s) => s.nis && !usernameAda.has(String(s.nis).toLowerCase()))
          .map((s) => ({ nis: String(s.nis), nama: s.namaLengkap })),
      );
    } catch (err) {
      showErrorDialog(pesanError(err, "Gagal memuat data siswa"));
      setSiswaTanpaAkun([]);
    } finally {
      setMemuatSiswa(false);
    }
  };

  const prosesMassal = async () => {
    if (passwordMassal.length < 8) {
      showErrorDialog("Password awal minimal 8 karakter");
      return;
    }
    if (!siswaTanpaAkun.length) {
      showErrorDialog("Tidak ada siswa yang perlu dibuatkan akun");
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

        <AdminTable
          columns={["Username", "Nama", "Role", "Status Password", "Dibuat", "Status", "Aksi"]}
          loading={loading}
          empty={!loading && terfilter.length === 0}
        >
          {terfilter.map((item) => (
            <tr key={item.id}>
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
          Username setiap akun memakai NIS siswa. Password awal di bawah ini berlaku untuk semua
          akun yang dibuat, dan siswa dapat menggantinya sendiri setelah login.
        </p>
        <div className="smk-form-group">
          <label>Password Awal (minimal 8 karakter)</label>
          <input value={passwordMassal} onChange={(e) => setPasswordMassal(e.target.value)} />
        </div>
        <div className="smk-form-group">
          <label>
            Siswa yang belum punya akun:{" "}
            {memuatSiswa ? "memuat..." : `${siswaTanpaAkun.length} siswa`}
          </label>
          <div className="smk-akun-preview">
            {siswaTanpaAkun.slice(0, 50).map((s) => (
              <div key={s.nis}>
                {s.nis} — {s.nama}
              </div>
            ))}
            {siswaTanpaAkun.length > 50 && <div>dan {siswaTanpaAkun.length - 50} lainnya...</div>}
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
