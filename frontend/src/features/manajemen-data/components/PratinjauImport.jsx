import Icon from "../../../components/Icon";

/**
 * Pratinjau sebelum data Excel benar-benar disimpan.
 *
 * Sebelumnya memilih berkas langsung menyimpan seluruh isinya; admin baru
 * tahu hasilnya setelah terjadi, dan satu berkas yang salah pilih berarti
 * ratusan baris harus dihapus satu per satu. Di sini isinya dibaca dulu di
 * server tanpa disimpan, ditampilkan apa adanya, lalu menunggu persetujuan.
 */

function Angka({ nilai, label, warna }) {
  return (
    <div className={`pratinjau-angka${warna ? ` ${warna}` : ""}`}>
      <span className="pratinjau-angka-nilai">{nilai}</span>
      <span className="pratinjau-angka-label">{label}</span>
    </div>
  );
}

export default function PratinjauImport({
  terbuka,
  namaBerkas,
  memuat,
  memproses,
  hasil,
  kolom,
  label = "data",
  onBatal,
  onKonfirmasi,
}) {
  if (!terbuka) return null;

  const ringkasan = hasil?.ringkasan;
  const contoh = hasil?.contoh || [];
  const duplikat = hasil?.duplikat || [];
  const tanpaNisn = hasil?.tanpaNisn || [];
  const kolomTerisi = hasil?.kolomTerisi || [];
  const tidakAdaYangMasuk = ringkasan && ringkasan.akanMasuk === 0;

  return (
    <div className="modal-overlay" onClick={memproses ? undefined : onBatal}>
      <div className="modal-box pratinjau-box" onClick={(e) => e.stopPropagation()}>
        <div className="pratinjau-kepala">
          <div className="modal-icon">
            <Icon name="upload" size={24} />
          </div>
          <div>
            <h2 className="modal-title" style={{ textAlign: "left", margin: 0 }}>
              Periksa dulu sebelum disimpan
            </h2>
            <p className="pratinjau-berkas">{namaBerkas}</p>
          </div>
        </div>

        {memuat ? (
          <p className="pratinjau-status">Membaca isi berkas...</p>
        ) : !ringkasan ? (
          <p className="pratinjau-status gagal">Berkas tidak bisa dibaca.</p>
        ) : (
          <>
            <div className="pratinjau-angka-baris">
              <Angka nilai={ringkasan.totalBaris} label="baris terbaca" />
              <Angka nilai={ringkasan.akanMasuk} label={`${label} akan masuk`} warna="hijau" />
              {ringkasan.duplikat > 0 && (
                <Angka nilai={ringkasan.duplikat} label="duplikat dilewati" warna="kuning" />
              )}
              {ringkasan.tanpaNisn > 0 && (
                <Angka nilai={ringkasan.tanpaNisn} label="tanpa NISN" warna="kuning" />
              )}
              {ringkasan.dilewati > 0 && (
                <Angka nilai={ringkasan.dilewati} label="baris tidak terbaca" warna="abu" />
              )}
            </div>

            {kolomTerisi.length > 0 && (
              <p className="pratinjau-catatan">
                <strong>{kolomTerisi.length} kolom</strong> terbaca dari berkas ini
                {kolomTerisi.length <= 12 ? `: ${kolomTerisi.join(", ")}.` : "."}
              </p>
            )}

            {tidakAdaYangMasuk ? (
              <p className="pratinjau-status gagal">
                Tidak ada baris yang bisa disimpan dari berkas ini.
              </p>
            ) : (
              <>
                <p className="pratinjau-catatan">
                  Contoh {Math.min(contoh.length, 50)} baris pertama dari{" "}
                  {ringkasan.akanMasuk} yang akan disimpan:
                </p>
                <div className="pratinjau-tabel-bungkus">
                  <table className="pratinjau-tabel">
                    <thead>
                      <tr>
                        <th>No</th>
                        {kolom.map((k) => (
                          <th key={k.kunci}>{k.judul}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contoh.map((baris, i) => (
                        <tr key={`${baris.nisn || baris.nip || i}-${i}`}>
                          <td>{i + 1}</td>
                          {kolom.map((k) => (
                            <td key={k.kunci}>{baris[k.kunci] || "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {duplikat.length > 0 && (
              <details className="pratinjau-rincian">
                <summary>
                  {ringkasan.duplikat} akan dilewati karena sudah ada di sistem
                </summary>
                <ul>
                  {duplikat.map((d, i) => (
                    <li key={`${d.nisn || d.nip}-${i}`}>
                      {d.nama} — {d.nisn || d.nip}
                    </li>
                  ))}
                  {ringkasan.duplikat > duplikat.length && (
                    <li>dan {ringkasan.duplikat - duplikat.length} lainnya...</li>
                  )}
                </ul>
              </details>
            )}

            {tanpaNisn.length > 0 && (
              <details className="pratinjau-rincian">
                <summary>
                  {ringkasan.tanpaNisn} tetap disimpan meski NISN-nya kosong
                </summary>
                <p className="pratinjau-rincian-ket">
                  Data tetap masuk, tetapi belum bisa dibuatkan akun sampai NISN-nya diisi.
                </p>
                <ul>
                  {tanpaNisn.map((nama, i) => (
                    <li key={`${nama}-${i}`}>{nama}</li>
                  ))}
                  {ringkasan.tanpaNisn > tanpaNisn.length && (
                    <li>dan {ringkasan.tanpaNisn - tanpaNisn.length} lainnya...</li>
                  )}
                </ul>
              </details>
            )}
          </>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onBatal} className="btn-cancel" disabled={memproses}>
            Batal
          </button>
          <button
            type="button"
            onClick={onKonfirmasi}
            className="btn-save"
            disabled={memuat || memproses || !ringkasan || tidakAdaYangMasuk}
          >
            {memproses
              ? "Menyimpan..."
              : ringkasan
                ? `Ya, simpan ${ringkasan.akanMasuk} ${label}`
                : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
