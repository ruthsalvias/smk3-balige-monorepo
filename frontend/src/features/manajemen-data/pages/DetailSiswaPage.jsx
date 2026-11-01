import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import manajemenApi from "../api/manajemenApi.js";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import Icon from "../../../components/Icon";
import DaftarDokumen from "../../../components/DaftarDokumen";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  JENIS_DOKUMEN,
  kelompokkanDokumen,
  lihatDokumenSiswa,
  unduhDokumenSiswa,
} from "../../akun/api/dokumenApi";
import "../resources/manajemen.css";

/**
 * Halaman penuh berisi seluruh kolom data siswa.
 *
 * Sebelumnya detail siswa muncul sebagai modal ringkas berisi sembilan kolom
 * saja. Data Dapodik punya lebih dari 60 kolom, yang tidak muat dan tidak
 * nyaman dibaca di dalam modal.
 */

const IKON_KELOMPOK = {
  Identitas: "students",
  "Rombel & Sekolah": "book",
  Alamat: "mapPin",
  Kontak: "phone",
  "Data Ayah": "users",
  "Data Ibu": "users",
  "Data Wali": "users",
  "Bantuan & Kesejahteraan": "shield",
  "Fisik & Keluarga": "target",
};

const LABEL_STATUS = {
  aktif: "Aktif",
  lulus: "Lulus",
  pindah: "Pindah",
  keluar: "Keluar",
};

export default function DetailSiswaPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [skema, setSkema] = useState(null);
  const [siswa, setSiswa] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [hanyaTerisi, setHanyaTerisi] = useState(true);

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
        setSkema(resSkema?.data || resSkema);
        setSiswa(resSiswa?.data?.siswa || resSiswa?.data || resSiswa);
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

  const lihatDokumen = async (dok) => {
    try {
      await lihatDokumenSiswa(id, dok.id);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const unduhDokumen = async (dok) => {
    try {
      await unduhDokumenSiswa(id, dok.id, dok.nama);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const tampilkanNilai = (field) => {
    const mentah = siswa?.[field.key];
    const teks = String(mentah ?? "").trim();
    if (!teks) return "";
    if (field.key === "status") return LABEL_STATUS[teks] || teks;
    return teks;
  };

  const dokumen = siswa ? kelompokkanDokumen(siswa) : {};

  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">
        <div className="smk-header-area">
          <h1 className="smk-section-title">
            Detail <span className="text-primary">Data Siswa</span>
          </h1>
          <p className="smk-section-subtitle">
            {memuat
              ? "Memuat data..."
              : siswa
                ? `${siswa.namaLengkap} · ${siswa.kelas || "tanpa kelas"} ${siswa.jurusan || ""}`.trim()
                : "Data siswa tidak ditemukan"}
          </p>
        </div>

        <div className="smk-manajemen-container">
          {memuat ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: "40px" }}>
              Memuat data siswa...
            </div>
          ) : !siswa || !skema ? (
            <div style={{ textAlign: "center", color: "#ef4444", padding: "40px" }}>
              Data siswa tidak ditemukan.
            </div>
          ) : (
            <>
              <div className="detail-toolbar">
                <label className="detail-toggle">
                  <input
                    type="checkbox"
                    checked={hanyaTerisi}
                    onChange={(e) => setHanyaTerisi(e.target.checked)}
                  />
                  Sembunyikan kolom yang kosong
                </label>

                <div className="detail-toolbar-aksi">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate(adminPath("/data/siswa"))}
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={() => navigate(adminPath(`/data/siswa/edit/${id}`))}
                  >
                    Edit Data
                  </button>
                </div>
              </div>

              {(skema.kelompok || []).map((nama) => {
                const isiKelompok = (skema.field || []).filter((f) => f.kelompok === nama);
                const terlihat = hanyaTerisi
                  ? isiKelompok.filter((f) => tampilkanNilai(f) !== "")
                  : isiKelompok;
                if (terlihat.length === 0) return null;

                return (
                  <div className="form-section" key={nama}>
                    <div className="form-section-header">
                      <div className="form-section-icon">
                        <Icon name={IKON_KELOMPOK[nama] || "fileText"} size={20} />
                      </div>
                      <div>
                        <h2 className="form-section-title">{nama}</h2>
                        <p className="form-section-desc">
                          {terlihat.length} dari {isiKelompok.length} kolom terisi
                        </p>
                      </div>
                    </div>

                    <dl className="detail-grid">
                      {terlihat.map((f) => (
                        <div className="detail-row" key={f.key}>
                          <dt>{f.label}</dt>
                          <dd>{tampilkanNilai(f) || "-"}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}

              <div className="form-divider" />

              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon">
                    <Icon name="folder" size={20} />
                  </div>
                  <div>
                    <h2 className="form-section-title">Dokumen</h2>
                    <p className="form-section-desc">Rapor, SKL, dan ijazah yang sudah diunggah</p>
                  </div>
                </div>

                <dl className="detail-grid">
                  {JENIS_DOKUMEN.map((d) => (
                    <div className="detail-row" key={d.nilai}>
                      <dt>{d.label}</dt>
                      <dd>
                        <DaftarDokumen
                          dokumen={dokumen[d.nilai]}
                          onLihat={lihatDokumen}
                          onUnduh={unduhDokumen}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
