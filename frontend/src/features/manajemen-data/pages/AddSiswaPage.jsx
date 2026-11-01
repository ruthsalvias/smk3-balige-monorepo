import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import manajemenApi from "../api/manajemenApi.js";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import FormSiswaLengkap, { nilaiKosong } from "../components/FormSiswaLengkap.jsx";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import "../resources/manajemen.css";

export default function AddSiswaPage() {
  const navigate = useNavigate();

  const [skema, setSkema] = useState(null);
  const [form, setForm] = useState({});
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    let hidup = true;
    (async () => {
      try {
        const res = await manajemenApi.getSkemaSiswa();
        if (!hidup) return;
        const isi = res?.data || res;
        setSkema(isi);
        setForm(nilaiKosong(isi));
      } catch (err) {
        if (hidup) showErrorDialog(err.message);
      } finally {
        if (hidup) setMemuat(false);
      }
    })();
    return () => {
      hidup = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.namaLengkap?.trim()) {
      showErrorDialog("Nama lengkap wajib diisi");
      return;
    }
    if (!form.nisn?.trim()) {
      showErrorDialog("NISN wajib diisi");
      return;
    }

    setMenyimpan(true);
    try {
      // Kolom kosong tidak dikirim supaya pesan validasi backend tetap jelas
      // dan kolom lama tidak tertimpa string kosong.
      const isi = {};
      Object.entries(form).forEach(([key, value]) => {
        const teks = String(value ?? "").trim();
        if (teks !== "") isi[key] = teks;
      });

      await manajemenApi.postSiswa(isi);
      showSuccessDialog("Siswa berhasil ditambahkan");
      navigate(adminPath("/data/siswa"));
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">
        <div className="smk-header-area">
          <h1 className="smk-section-title">
            Tambah <span className="text-primary">Siswa Baru</span>
          </h1>
          <p className="smk-section-subtitle">
            Hanya Nama Lengkap dan NISN yang wajib diisi. Kolom lain boleh dilengkapi menyusul.
          </p>
        </div>

        <div className="smk-manajemen-container">
          {memuat ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: "30px" }}>Memuat form...</div>
          ) : !skema ? (
            <div style={{ textAlign: "center", color: "#ef4444", padding: "30px" }}>Skema data siswa gagal dimuat.</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormSiswaLengkap skema={skema} nilai={form} onChange={handleChange} />

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate(adminPath("/data/siswa"))}
                  className="btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="btn-save" disabled={menyimpan}>
                  {menyimpan ? "Menyimpan..." : "Simpan Siswa"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
