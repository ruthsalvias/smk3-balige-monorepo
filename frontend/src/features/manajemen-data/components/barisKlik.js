/**
 * Membuat satu baris tabel bisa diklik untuk membuka detail.
 *
 * Sel kotak centang dan menu aksi dikecualikan, begitu juga semua tombol,
 * tautan, dan isian di dalam baris — tanpa itu, mencentang satu siswa akan
 * ikut membuka halaman detailnya.
 *
 * Baris juga bisa dicapai lewat Tab dan dibuka dengan Enter atau spasi,
 * supaya tetap terpakai tanpa tetikus.
 */

const ABAIKAN = "button, a, input, select, textarea, label, .kolom-pilih, .aksi, .kolom-aksi";

export default function propsBarisKlik(onBuka, keterangan) {
  const buka = () => onBuka?.();

  return {
    className: "baris-klik",
    tabIndex: 0,
    role: "button",
    "aria-label": keterangan,
    onClick: (e) => {
      if (e.target.closest(ABAIKAN)) return;
      // Jangan buka detail kalau pengguna sedang menyeleksi teks.
      if (window.getSelection?.()?.toString()) return;
      buka();
    },
    onKeyDown: (e) => {
      if (e.target !== e.currentTarget) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      buka();
    },
  };
}
