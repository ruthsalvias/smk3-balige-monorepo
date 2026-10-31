// Komponen bersama untuk memilih banyak baris lalu menghapusnya sekaligus.
// Dipakai di Data Siswa, Data Guru, dan Kelola Akun.

import { useEffect, useState } from "react";
import Icon from "./Icon";

/** Di atas jumlah ini, pengguna wajib mengetik kata konfirmasi. */
const AMBANG_KETIK = 20;
const KATA_KONFIRMASI = "HAPUS";

/** Bilah yang muncul begitu ada baris terpilih. */
export function BilahPilihan({
  jumlah,
  totalTampil,
  label = "data",
  memproses = false,
  onPilihSemua,
  onBersihkan,
  onHapus,
}) {
  if (jumlah === 0) return null;

  return (
    <div className="smk-bulk-bar" role="region" aria-label={`${jumlah} ${label} dipilih`}>
      <span className="smk-bulk-info">
        <Icon name="shield" size={16} />
        <strong>{jumlah}</strong> {label} dipilih
      </span>

      <div className="smk-bulk-aksi">
        {jumlah < totalTampil && (
          <button type="button" className="smk-bulk-link" onClick={onPilihSemua}>
            Pilih semua {totalTampil} yang tampil
          </button>
        )}
        <button type="button" className="smk-bulk-link" onClick={onBersihkan}>
          Batal pilih
        </button>
        <button
          type="button"
          className="smk-bulk-hapus"
          onClick={onHapus}
          disabled={memproses}
        >
          <Icon name="trash" size={15} /> Hapus {jumlah} {label}
        </button>
      </div>
    </div>
  );
}

/** Kotak centang satu baris. */
export function KotakPilih({ dipilih, onUbah, judul }) {
  return (
    <input
      type="checkbox"
      className="smk-bulk-checkbox"
      checked={dipilih}
      onChange={onUbah}
      onClick={(e) => e.stopPropagation()}
      aria-label={judul}
      title={judul}
    />
  );
}

/** Kotak centang di kepala tabel, mendukung keadaan sebagian terpilih. */
export function KotakPilihSemua({ semua, sebagian, onUbah }) {
  return (
    <input
      type="checkbox"
      className="smk-bulk-checkbox"
      ref={(el) => {
        if (el) el.indeterminate = sebagian;
      }}
      checked={semua}
      onChange={onUbah}
      aria-label="Pilih semua baris"
      title="Pilih semua baris"
    />
  );
}

/**
 * Dialog konfirmasi sebelum penghapusan massal dijalankan.
 * Menampilkan jumlah pasti, contoh data, dan — untuk jumlah besar —
 * meminta pengguna mengetik kata konfirmasi supaya tidak terjadi
 * penghapusan tidak sengaja.
 */
export default function KonfirmasiHapusMassal({
  terbuka,
  jumlah,
  contoh = [],
  label = "data",
  memproses = false,
  onBatal,
  onKonfirmasi,
}) {
  const [ketikan, setKetikan] = useState("");
  const perluKetik = jumlah >= AMBANG_KETIK;

  useEffect(() => {
    if (terbuka) setKetikan("");
  }, [terbuka]);

  useEffect(() => {
    if (!terbuka) return undefined;
    const tanganiTombol = (e) => {
      if (e.key === "Escape" && !memproses) onBatal?.();
    };
    window.addEventListener("keydown", tanganiTombol);
    return () => window.removeEventListener("keydown", tanganiTombol);
  }, [terbuka, memproses, onBatal]);

  if (!terbuka) return null;

  const konfirmasiCocok = ketikan.trim().toUpperCase() === KATA_KONFIRMASI;
  const bolehHapus = !memproses && jumlah > 0 && (!perluKetik || konfirmasiCocok);
  const sisa = jumlah - contoh.length;

  return (
    <div
      className="smk-modal-overlay"
      onClick={() => !memproses && onBatal?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-hapus-massal"
    >
      <div className="smk-modal smk-admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="smk-modal-header smk-modal-header-bahaya">
          <h3 id="judul-hapus-massal">Konfirmasi Hapus {jumlah} {label}</h3>
          <button
            className="smk-modal-close"
            onClick={() => !memproses && onBatal?.()}
            aria-label="Tutup"
            disabled={memproses}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="smk-modal-body">
          <div className="smk-bulk-peringatan">
            <span className="smk-bulk-peringatan-ikon">
              <Icon name="warning" size={22} />
            </span>
            <div>
              <strong>
                Anda akan menghapus {jumlah} {label} secara permanen.
              </strong>
              <p>Data yang sudah dihapus tidak dapat dikembalikan.</p>
            </div>
          </div>

          {contoh.length > 0 && (
            <div className="smk-bulk-daftar">
              <span className="smk-bulk-daftar-judul">Yang akan dihapus:</span>
              <ul>
                {contoh.map((nama, i) => (
                  <li key={`${nama}-${i}`}>{nama}</li>
                ))}
              </ul>
              {sisa > 0 && (
                <span className="smk-bulk-daftar-sisa">dan {sisa} {label} lainnya</span>
              )}
            </div>
          )}

          {perluKetik && (
            <div className="smk-form-group">
              <label htmlFor="konfirmasi-hapus-massal">
                Karena jumlahnya banyak, ketik <strong>{KATA_KONFIRMASI}</strong> untuk melanjutkan
              </label>
              <input
                id="konfirmasi-hapus-massal"
                className="smk-form-input"
                value={ketikan}
                onChange={(e) => setKetikan(e.target.value)}
                placeholder={KATA_KONFIRMASI}
                autoComplete="off"
                autoFocus
                disabled={memproses}
              />
            </div>
          )}
        </div>

        <div className="smk-modal-footer">
          <button
            className="smk-btn-cancel"
            onClick={() => onBatal?.()}
            disabled={memproses}
          >
            Batal
          </button>
          <button className="smk-btn-bahaya" onClick={() => onKonfirmasi?.()} disabled={!bolehHapus}>
            {memproses ? (
              <>
                <span className="smk-admin-spinner smk-admin-spinner-sm" /> Menghapus...
              </>
            ) : (
              <>
                <Icon name="trash" size={15} /> Ya, Hapus {jumlah} {label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
