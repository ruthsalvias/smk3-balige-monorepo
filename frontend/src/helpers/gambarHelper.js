// Penyiapan gambar sebelum diunggah.
//
// Reverse proxy di depan aplikasi punya batas ukuran body sendiri. Kalau batas
// itu terlampaui, yang kembali adalah halaman error HTML — bukan JSON — dan
// pesannya jadi tidak terbaca di UI. Mengecilkan gambar di browser membuat
// unggahan tetap lolos tanpa bergantung pada konfigurasi proxy.

/** Batas ukuran yang ditampilkan ke pengguna dan dipakai sebagai penolakan akhir. */
export const MAKS_UKURAN_MB = 10;

/** Sisi terpanjang hasil pengecilan. Cukup tajam untuk ditampilkan di web. */
const MAKS_SISI = 1920;

/** Di bawah ini gambar dibiarkan apa adanya supaya kualitas asli tidak berubah. */
const AMBANG_BYTE = 1024 * 1024;

/** Hanya format raster yang bisa digambar ulang lewat canvas. */
const TIPE_BISA_DIKECILKAN = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ukuranTerbaca(byte) {
  const nilai = Number(byte) || 0;
  if (nilai < 1024) return `${nilai} B`;
  if (nilai < 1024 * 1024) return `${(nilai / 1024).toFixed(0)} KB`;
  return `${(nilai / 1024 / 1024).toFixed(1)} MB`;
}

function bacaGambar(file) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak dapat dibaca"));
    };
    img.src = url;
  });
}

/**
 * Mengecilkan gambar bila melebihi ambang, dengan mempertahankan tipe aslinya
 * supaya PNG transparan tidak berubah jadi latar hitam.
 * Mengembalikan file asli kalau pengecilan tidak memungkinkan atau tidak
 * menghasilkan berkas yang lebih kecil.
 */
export async function siapkanGambar(file) {
  if (!file || !TIPE_BISA_DIKECILKAN.includes(file.type)) return file;
  if (file.size <= AMBANG_BYTE) return file;

  try {
    const sumber = await bacaGambar(file);
    const lebarAsli = sumber.naturalWidth || sumber.width;
    const tinggiAsli = sumber.naturalHeight || sumber.height;
    if (!lebarAsli || !tinggiAsli) return file;

    const skala = Math.min(1, MAKS_SISI / Math.max(lebarAsli, tinggiAsli));
    const lebar = Math.max(1, Math.round(lebarAsli * skala));
    const tinggi = Math.max(1, Math.round(tinggiAsli * skala));

    const kanvas = document.createElement("canvas");
    kanvas.width = lebar;
    kanvas.height = tinggi;
    const konteks = kanvas.getContext("2d");
    if (!konteks) return file;
    konteks.drawImage(sumber, 0, 0, lebar, tinggi);
    if (typeof sumber.close === "function") sumber.close();

    const tipe = file.type === "image/jpg" ? "image/jpeg" : file.type;
    const blob = await new Promise((resolve) => {
      // PNG tidak mengenal parameter kualitas; penghematannya datang dari dimensi.
      kanvas.toBlob(resolve, tipe, tipe === "image/png" ? undefined : 0.85);
    });

    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name, { type: tipe, lastModified: Date.now() });
  } catch {
    // Browser lama atau berkas rusak — biarkan server yang menolak.
    return file;
  }
}

/**
 * Memvalidasi lalu menyiapkan gambar. Mengembalikan { file } bila lolos,
 * atau { pesan } berisi alasan penolakan.
 */
export async function validasiDanSiapkanGambar(berkas) {
  if (!berkas) return { pesan: "Tidak ada berkas yang dipilih." };

  if (!berkas.type.startsWith("image/")) {
    return { pesan: "Berkas harus berupa gambar (PNG, JPG, atau WEBP)." };
  }

  const file = await siapkanGambar(berkas);

  if (file.size > MAKS_UKURAN_MB * 1024 * 1024) {
    return {
      pesan:
        `Ukuran gambar ${ukuranTerbaca(file.size)} masih melebihi batas ${MAKS_UKURAN_MB} MB. ` +
        "Perkecil gambar terlebih dahulu lalu coba lagi.",
    };
  }

  return { file };
}
