import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../../profil/components/NavbarComponent";
import Footer from "../../profil/components/FooterComponent";
import Icon from "../../../components/Icon";
import DaftarDokumen from "../../../components/DaftarDokumen";
import KotakCari from "../../../components/KotakCari";
import { useAuth } from "../../auth/context/AuthContext";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  JENIS_DOKUMEN,
  cariSiswaUntukGuru,
  hapusDokumenSiswa,
  kelompokkanDokumen,
  lihatDokumenSiswa,
  unduhDokumenSiswa,
  unggahDokumenSiswa,
} from "../api/dokumenApi";

export default function GuruDokumenPage() {
  const { isAuth, login, roles } = useAuth();
  const boleh = roles.includes("guru") || roles.includes("admin");

  const [siswa, setSiswa] = useState([]);
  const [memuat, setMemuat] = useState(false);
  const [cari, setCari] = useState("");
  const [mengunggah, setMengunggah] = useState("");
  const inputRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (!isAuth || !boleh) return;
    muat();
  }, [isAuth, boleh]);

  const muat = async () => {
    setMemuat(true);
    try {
      setSiswa(await cariSiswaUntukGuru());
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setMemuat(false);
    }
  };

  const terfilter = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    if (!kunci) return siswa;
    return siswa.filter(
      (s) =>
        s.namaLengkap?.toLowerCase().includes(kunci) ||
        String(s.nis || "").includes(kunci) ||
        String(s.nisn || "").includes(kunci) ||
        s.kelas?.toLowerCase().includes(kunci),
    );
  }, [siswa, cari]);

  const pilihFile = (siswaId, jenis) => {
    targetRef.current = { siswaId, jenis };
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const prosesUnggah = async (e) => {
    const files = Array.from(e.target.files || []);
    const target = targetRef.current;
    if (!files.length || !target) return;

    setMengunggah(`${target.siswaId}-${target.jenis}`);
    try {
      const siswaTerbaru = await unggahDokumenSiswa(target.siswaId, target.jenis, files);
      perbaruiSiswa(siswaTerbaru);
      showSuccessDialog(`${files.length} file ${target.jenis.toUpperCase()} berhasil diunggah`);
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setMengunggah("");
      targetRef.current = null;
    }
  };

  const perbaruiSiswa = (data) => {
    if (!data?.id) return muat();
    setSiswa((sebelumnya) => sebelumnya.map((s) => (s.id === data.id ? data : s)));
  };

  const lihat = async (siswaId, dok) => {
    try {
      await lihatDokumenSiswa(siswaId, dok.id);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const unduh = async (siswaId, dok) => {
    try {
      await unduhDokumenSiswa(siswaId, dok.id, dok.nama);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const hapus = async (siswaId, dok) => {
    const konfirmasi = await showConfirmDialog(`Hapus file ${dok.nama}?`);
    if (!konfirmasi.isConfirmed) return;
    try {
      await hapusDokumenSiswa(siswaId, dok.id);
      await muat();
      showSuccessDialog("Dokumen dihapus");
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  if (!isAuth) {
    return (
      <div className="smk-akun-gate">
        <p>Silakan masuk sebagai guru untuk mengelola dokumen siswa.</p>
        <button className="smk-btn-primary" onClick={login}>
          Masuk
        </button>
      </div>
    );
  }

  if (!boleh) {
    return (
      <div className="smk-akun-gate">
        <p>Halaman ini khusus guru.</p>
      </div>
    );
  }

  return (
    <div className="smk-akun-page">
      <Navbar />

      <section className="smk-subpage-hero">
        <div className="smk-container smk-center">
          <span className="smk-badge">Guru</span>
          <h1 className="smk-subpage-title">Dokumen Siswa</h1>
          <p className="smk-subpage-subtitle">
            Unggah rapor, ijazah, dan SKL siswa. Siswa dapat mengunduh dokumen miliknya sendiri.
          </p>
        </div>
      </section>

      <div className="smk-akun-wrap wide">
        <div className="smk-akun-panel">
          <div className="smk-akun-toolbar">
            <span className="smk-akun-hint">
              <Icon name="students" size={16} /> {terfilter.length} siswa
            </span>
            <KotakCari
              nilai={cari}
              onUbah={setCari}
              placeholder="Cari nama, NIS, NISN, atau kelas..."
              jumlah={terfilter.length}
              labelJumlah="siswa"
            />
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            style={{ display: "none" }}
            onChange={prosesUnggah}
          />

          <div className="smk-akun-tabel-wrap">
            <table className="smk-akun-tabel">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NIS</th>
                  <th>Kelas</th>
                  {JENIS_DOKUMEN.map((d) => (
                    <th key={d.nilai}>{d.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memuat ? (
                  <tr>
                    <td colSpan={6}>Memuat data siswa...</td>
                  </tr>
                ) : terfilter.length === 0 ? (
                  <tr>
                    <td colSpan={6}>Data siswa tidak ditemukan</td>
                  </tr>
                ) : (
                  terfilter.map((s) => {
                    const dokumen = kelompokkanDokumen(s);
                    return (
                      <tr key={s.id}>
                        <td>{s.namaLengkap}</td>
                        <td>{s.nis || "-"}</td>
                        <td>{s.kelas || "-"}</td>
                        {JENIS_DOKUMEN.map((d) => (
                          <td key={d.nilai}>
                            <DaftarDokumen
                              dokumen={dokumen[d.nilai]}
                              mengunggah={mengunggah === `${s.id}-${d.nilai}`}
                              onLihat={(dok) => lihat(s.id, dok)}
                              onUnduh={(dok) => unduh(s.id, dok)}
                              onHapus={(dok) => hapus(s.id, dok)}
                              onUnggah={() => pilihFile(s.id, d.nilai)}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
