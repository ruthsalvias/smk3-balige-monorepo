/**
 * Navigasi halaman untuk tabel panel admin.
 *
 * Sebelumnya hanya ada tombol Prev, angka halaman saat ini, dan Next, sehingga
 * admin tidak tahu ada berapa halaman seluruhnya maupun sedang melihat data
 * ke berapa. Komponen ini menampilkan keduanya dan menyediakan lompatan
 * langsung ke nomor halaman.
 *
 * Nomor halaman diringkas dengan elipsis bila jumlahnya banyak, supaya 15
 * halaman tidak berubah menjadi 15 tombol sebaris.
 */

/** Deretan nomor yang ditampilkan: selalu halaman pertama, terakhir, dan tetangga halaman aktif. */
function susunNomor(halamanAktif, totalHalaman) {
  if (totalHalaman <= 7) {
    return Array.from({ length: totalHalaman }, (_, i) => i + 1);
  }

  const nomor = new Set([1, totalHalaman, halamanAktif]);
  if (halamanAktif - 1 > 1) nomor.add(halamanAktif - 1);
  if (halamanAktif + 1 < totalHalaman) nomor.add(halamanAktif + 1);
  if (halamanAktif <= 3) [2, 3, 4].forEach((n) => n < totalHalaman && nomor.add(n));
  if (halamanAktif >= totalHalaman - 2) {
    [totalHalaman - 3, totalHalaman - 2, totalHalaman - 1].forEach((n) => n > 1 && nomor.add(n));
  }

  const urut = [...nomor].sort((a, b) => a - b);
  const hasil = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push("...");
    hasil.push(n);
  });
  return hasil;
}

export default function Paginasi({
  halaman,
  totalData,
  perHalaman,
  jumlahTampil,
  label = "data",
  onPindah,
}) {
  const total = Number(totalData) || 0;
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  const aktif = Math.min(Math.max(1, halaman), totalHalaman);

  const mulai = total === 0 ? 0 : (aktif - 1) * perHalaman + 1;
  const akhir = total === 0 ? 0 : Math.min(mulai + (jumlahTampil ?? perHalaman) - 1, total);

  return (
    <div className="paginasi">
      <span className="paginasi-info">
        {total === 0 ? (
          <>Tidak ada {label}</>
        ) : (
          <>
            Menampilkan <strong>{mulai}–{akhir}</strong> dari <strong>{total}</strong> {label}
            {totalHalaman > 1 && (
              <span className="paginasi-info-halaman">
                {" "}· halaman {aktif} dari {totalHalaman}
              </span>
            )}
          </>
        )}
      </span>

      {totalHalaman > 1 && (
        <div className="paginasi-tombol">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPindah(aktif - 1)}
            disabled={aktif <= 1}
          >
            ‹ Prev
          </button>

          {susunNomor(aktif, totalHalaman).map((n, i) =>
            n === "..." ? (
              <span className="paginasi-elipsis" key={`sela-${i}`}>
                …
              </span>
            ) : (
              <button
                type="button"
                key={n}
                className={`pagination-btn${n === aktif ? " active" : ""}`}
                onClick={() => onPindah(n)}
                aria-current={n === aktif ? "page" : undefined}
              >
                {n}
              </button>
            ),
          )}

          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPindah(aktif + 1)}
            disabled={aktif >= totalHalaman}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
