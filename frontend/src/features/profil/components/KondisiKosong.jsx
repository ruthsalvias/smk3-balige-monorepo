import Icon from "../../../components/Icon";

/**
 * Tampilan untuk bagian halaman profil yang datanya belum diisi admin.
 *
 * Sebelumnya bagian Struktur Organisasi menampilkan bagan contoh berisi
 * "Kepala Sekolah", "Waka Kurikulum", dan seterusnya. Bagan itu tidak berasal
 * dari data sekolah mana pun, tetapi pengunjung tidak punya cara membedakannya
 * dari bagan asli — persis masalah yang dikeluhkan.
 *
 * Bagian lain memakai satu baris teks abu-abu yang mudah terlewat. Keduanya
 * kini memakai tampilan yang sama: jelas kosong, dan tidak menyesatkan.
 *
 * `ringkas` dipakai di dalam kartu atau panel sempit, tempat kartu ukuran
 * penuh akan terlihat sesak.
 */
export default function KondisiKosong({ ikon = "fileText", judul, keterangan, ringkas = false }) {
  return (
    <div className={`smk-kosong${ringkas ? " smk-kosong-ringkas" : ""}`}>
      <span className="smk-kosong-ikon" aria-hidden="true">
        <Icon name={ikon} size={ringkas ? 20 : 28} />
      </span>
      <p className="smk-kosong-judul">{judul}</p>
      {keterangan && <p className="smk-kosong-ket">{keterangan}</p>}
    </div>
  );
}
