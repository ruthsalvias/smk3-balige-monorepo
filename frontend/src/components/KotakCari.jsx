import { useRef } from "react";
import Icon from "./Icon";
import "./KotakCari.css";

/**
 * Kotak pencarian untuk tabel di panel admin.
 *
 * Dibuat satu komponen supaya pencarian di Data Siswa, Data Guru, Kelola Akun,
 * dan halaman dokumen guru terlihat dan berperilaku sama. Kotak sebelumnya
 * hanya selebar 160px sehingga tulisan petunjuknya terpotong di tengah jalan.
 *
 * - Melebar mengikuti ruang yang tersedia, dengan batas atas agar tidak
 *   memanjang berlebihan di layar lebar.
 * - Tombol silang membersihkan isian; tombol Escape melakukan hal yang sama.
 * - `jumlah` menampilkan banyaknya hasil, supaya jelas pencarian sedang aktif.
 * - `onBersihkan` dipakai halaman yang perlu memuat ulang isinya saat
 *   pencarian dibatalkan, bukan sekadar mengosongkan kotak.
 */
export default function KotakCari({
  nilai = "",
  onUbah,
  placeholder = "Cari...",
  jumlah = null,
  labelJumlah = "hasil",
  autoFocus = false,
  onBersihkan,
}) {
  const inputRef = useRef(null);

  const bersihkan = () => {
    if (onBersihkan) onBersihkan();
    else onUbah?.("");
    inputRef.current?.focus();
  };

  const adaIsi = String(nilai).length > 0;

  return (
    <div className={`kotak-cari${adaIsi ? " terisi" : ""}`}>
      <span className="kotak-cari-ikon" aria-hidden="true">
        <Icon name="search" size={17} />
      </span>

      <input
        ref={inputRef}
        type="search"
        className="kotak-cari-input"
        placeholder={placeholder}
        aria-label={placeholder}
        value={nilai}
        autoFocus={autoFocus}
        onChange={(e) => onUbah?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && adaIsi) {
            e.preventDefault();
            bersihkan();
          }
        }}
      />

      {adaIsi && jumlah !== null && (
        <span className="kotak-cari-jumlah">
          {jumlah} {labelJumlah}
        </span>
      )}

      {adaIsi && (
        <button
          type="button"
          className="kotak-cari-hapus"
          onClick={bersihkan}
          title="Bersihkan pencarian"
          aria-label="Bersihkan pencarian"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
