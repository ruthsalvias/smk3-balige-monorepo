import Icon from "../../../components/Icon";

/**
 * Form data siswa yang disusun dari skema backend (GET /management/siswa/skema).
 *
 * Kolomnya mengikuti export Dapodik — lebih dari 60 buah — sehingga menuliskan
 * satu per satu di JSX tidak terawat. Dengan menyusunnya dari skema, label dan
 * nama kolom tidak akan pernah berbeda dengan isi database.
 *
 * Dipakai bersama oleh halaman Tambah dan Ubah siswa.
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

const KETERANGAN_KELOMPOK = {
  Identitas: "Data pribadi dan identitas resmi siswa",
  "Rombel & Sekolah": "Rombel, kelas, jurusan, dan riwayat sekolah",
  Alamat: "Alamat tempat tinggal dan cara menuju sekolah",
  Kontak: "Nomor telepon dan surel yang bisa dihubungi",
  "Data Ayah": "Identitas dan pekerjaan ayah",
  "Data Ibu": "Identitas dan pekerjaan ibu",
  "Data Wali": "Diisi bila siswa tinggal bersama wali",
  "Bantuan & Kesejahteraan": "KPS, KIP, PIP, dan data rekening bantuan",
  "Fisik & Keluarga": "Data fisik dan jumlah saudara",
};

const LABEL_STATUS = {
  aktif: "Aktif",
  lulus: "Lulus",
  pindah: "Pindah",
  keluar: "Keluar",
};

function SatuField({ field, nilai, onChange }) {
  const { key, label, tipe, opsi, wajib } = field;
  const isiNilai = nilai ?? "";
  const panjang = tipe === "panjang";

  return (
    <div className={`form-field${panjang ? " col-span-2" : ""}`}>
      <label className="form-label" htmlFor={`field-${key}`}>
        {label} {wajib && <span className="required">*</span>}
      </label>

      {tipe === "pilihan" ? (
        <select
          id={`field-${key}`}
          name={key}
          value={isiNilai}
          onChange={onChange}
          className="form-input form-select"
        >
          {!wajib && <option value="">— tidak diisi —</option>}
          {(opsi || []).map((o) => (
            <option key={o} value={o}>
              {LABEL_STATUS[o] || o}
            </option>
          ))}
        </select>
      ) : panjang ? (
        <textarea
          id={`field-${key}`}
          name={key}
          value={isiNilai}
          onChange={onChange}
          className="form-input form-textarea"
          rows={3}
        />
      ) : (
        <input
          id={`field-${key}`}
          type={tipe === "tanggal" ? "date" : "text"}
          name={key}
          value={isiNilai}
          onChange={onChange}
          className="form-input"
          required={wajib}
        />
      )}
    </div>
  );
}

export default function FormSiswaLengkap({ skema, nilai, onChange }) {
  const kelompok = skema?.kelompok || [];
  const field = skema?.field || [];

  return (
    <>
      {kelompok.map((nama, urutan) => {
        const isiKelompok = field.filter((f) => f.kelompok === nama);
        if (isiKelompok.length === 0) return null;

        return (
          <div key={nama}>
            {urutan > 0 && <div className="form-divider" />}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">
                  <Icon name={IKON_KELOMPOK[nama] || "fileText"} size={20} />
                </div>
                <div>
                  <h2 className="form-section-title">{nama}</h2>
                  <p className="form-section-desc">{KETERANGAN_KELOMPOK[nama] || ""}</p>
                </div>
              </div>

              <div className="form-grid">
                {isiKelompok.map((f) => (
                  <SatuField key={f.key} field={f} nilai={nilai[f.key]} onChange={onChange} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Nilai awal kosong untuk seluruh kolom pada skema. */
export function nilaiKosong(skema) {
  const awal = {};
  (skema?.field || []).forEach((f) => {
    awal[f.key] = f.key === "status" ? "aktif" : "";
  });
  return awal;
}

/** Ambil nilai siswa yang ada ke dalam bentuk yang dipakai form. */
export function nilaiDariSiswa(skema, siswa) {
  const isi = nilaiKosong(skema);
  if (!siswa) return isi;
  Object.keys(isi).forEach((key) => {
    if (siswa[key] !== undefined && siswa[key] !== null) isi[key] = String(siswa[key]);
  });
  return isi;
}
