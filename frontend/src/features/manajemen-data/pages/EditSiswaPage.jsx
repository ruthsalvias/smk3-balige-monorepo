import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import manajemenApi from "../api/manajemenApi.js";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import FormSiswaLengkap, { nilaiDariSiswa } from "../components/FormSiswaLengkap.jsx";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import Icon from "../../../components/Icon";
import DaftarDokumen from "../../../components/DaftarDokumen";
import {
  JENIS_DOKUMEN,
  hapusDokumenSiswa,
  kelompokkanDokumen,
  lihatDokumenSiswa,
  unduhDokumenSiswa,
  unggahDokumenSiswa,
} from "../../akun/api/dokumenApi";
import "../resources/manajemen.css";

export default function EditSiswaPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [skema, setSkema] = useState(null);
  const [form, setForm] = useState({});
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [siswa, setSiswa] = useState(null);
  const [mengunggah, setMengunggah] = useState("");
  const inputRef = useRef(null);
  const jenisRef = useRef(null);

  // Data diambil langsung berdasarkan id, bukan dicari di daftar yang sudah
  // ada di store: daftar itu hanya berisi satu halaman, jadi siswa di halaman
  // berikutnya tidak akan pernah ketemu.
  useEffect(() => {
    let hidup = true;
    (async () => {
      setMemuat(true);
      try {
        const [resSkema, resSiswa] = await Promise.all([
          manajemenApi.getSkemaSiswa(),
          manajemenApi.getSiswaById(id),
        ]);
        if (!hidup) return;
        const isiSkema = resSkema?.data || resSkema;
        const siswa = resSiswa?.data?.siswa || resSiswa?.data || resSiswa;
        setSkema(isiSkema);
        setSiswa(siswa);
        setForm(nilaiDariSiswa(isiSkema, siswa));
      } catch (err) {
        if (hidup) showErrorDialog(err.message);
      } finally {
        if (hidup) setMemuat(false);
      }
    })();
    return () => {
      hidup = false;
    };
  }, [id]);

  const pilihFile = (jenis) => {
    jenisRef.current = jenis;
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const prosesUnggah = async (e) => {
    const files = Array.from(e.target.files || []);
    const jenis = jenisRef.current;
    if (!files.length || !jenis) return;

    setMengunggah(jenis);
    try {
      const terbaru = await unggahDokumenSiswa(id, jenis, files);
      if (terbaru?.id) setSiswa(terbaru);
      showSuccessDialog(`${files.length} file ${jenis.toUpperCase()} berhasil diunggah`);
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setMengunggah("");
      jenisRef.current = null;
    }
  };

  const hapusDokumen = async (dok) => {
    try {
      const terbaru = await hapusDokumenSiswa(id, dok.id);
      if (terbaru?.id) setSiswa(terbaru);
      showSuccessDialog("Dokumen dihapus");
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

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
      // Kolom yang dikosongkan tetap dikirim sebagai string kosong supaya
      // penghapusan isi benar-benar tersimpan.
      const isi = {};
      Object.entries(form).forEach(([key, value]) => {
        isi[key] = String(value ?? "").trim();
      });

      await manajemenApi.putSiswa(id, isi);
      showSuccessDialog("Data siswa berhasil diperbarui");
      navigate(adminPath(`/data/siswa/${id}`));
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
            Ubah <span className="text-primary">Data Siswa</span>
          </h1>
          <p className="smk-section-subtitle">
            {memuat ? "Memuat data..." : form.namaLengkap || "Data siswa"}
          </p>
        </div>

        <div className="smk-manajemen-container">
          {memuat ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: "40px" }}>
              Memuat data siswa...
            </div>
          ) : !skema ? (
            <div style={{ textAlign: "center", color: "#ef4444", padding: "40px" }}>
              Data siswa tidak ditemukan.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormSiswaLengkap skema={skema} nilai={form} onChange={handleChange} />

              <div className="form-divider" />

              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon">
                    <Icon name="folder" size={20} />
                  </div>
                  <div>
                    <h2 className="form-section-title">Dokumen</h2>
                    <p className="form-section-desc">Rapor, SKL, dan ijazah milik siswa ini</p>
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={prosesUnggah}
                />

                <dl className="detail-grid">
                  {JENIS_DOKUMEN.map((d) => (
                    <div className="detail-row" key={d.nilai}>
                      <dt>{d.label}</dt>
                      <dd>
                        <DaftarDokumen
                          dokumen={kelompokkanDokumen(siswa || {})[d.nilai]}
                          mengunggah={mengunggah === d.nilai}
                          onLihat={(dok) => lihatDokumenSiswa(id, dok.id).catch((err) => showErrorDialog(err.message))}
                          onUnduh={(dok) => unduhDokumenSiswa(id, dok.id, dok.nama).catch((err) => showErrorDialog(err.message))}
                          onHapus={hapusDokumen}
                          onUnggah={() => pilihFile(d.nilai)}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate(adminPath(`/data/siswa/${id}`))}
                  className="btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="btn-save" disabled={menyimpan}>
                  {menyimpan ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
