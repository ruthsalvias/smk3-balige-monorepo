/**
 * Katalog kolom data siswa.
 *
 * Satu daftar ini dipakai tiga tempat sekaligus: pemetaan saat impor Excel,
 * form tambah/ubah di admin, dan halaman detail siswa. Frontend mengambilnya
 * lewat GET /management/siswa/skema supaya labelnya tidak pernah berbeda
 * dengan isi database.
 *
 * `excel` berisi kemungkinan penulisan header di file Excel. Pencocokan
 * dilakukan setelah header dinormalkan (huruf kecil, tanpa tanda baca), jadi
 * "No. KPS" dan "no kps" sama saja.
 */

export type TipeField = 'teks' | 'tanggal' | 'pilihan' | 'panjang';

export interface FieldSiswa {
  key: string;
  label: string;
  kelompok: string;
  tipe: TipeField;
  excel: string[];
  wajib?: boolean;
  opsi?: string[];
}

export const KELOMPOK_FIELD = [
  'Identitas',
  'Rombel & Sekolah',
  'Alamat',
  'Kontak',
  'Data Ayah',
  'Data Ibu',
  'Data Wali',
  'Bantuan & Kesejahteraan',
  'Fisik & Keluarga',
];

export const STATUS_SISWA = ['aktif', 'lulus', 'pindah', 'keluar'];

export const FIELD_SISWA: FieldSiswa[] = [
  // Identitas
  { key: 'namaLengkap', label: 'Nama Lengkap', kelompok: 'Identitas', tipe: 'teks', wajib: true, excel: ['Nama Lengkap', 'Nama'] },
  { key: 'nisn', label: 'NISN', kelompok: 'Identitas', tipe: 'teks', wajib: true, excel: ['NISN'] },
  { key: 'nis', label: 'NIS / NIPD', kelompok: 'Identitas', tipe: 'teks', excel: ['NIPD', 'NIS'] },
  { key: 'jenisKelamin', label: 'Jenis Kelamin', kelompok: 'Identitas', tipe: 'pilihan', opsi: ['L', 'P'], excel: ['JK', 'Jenis Kelamin'] },
  { key: 'nik', label: 'NIK', kelompok: 'Identitas', tipe: 'teks', excel: ['NIK'] },
  { key: 'tempatLahir', label: 'Tempat Lahir', kelompok: 'Identitas', tipe: 'teks', excel: ['Tempat Lahir'] },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', kelompok: 'Identitas', tipe: 'tanggal', excel: ['Tanggal Lahir'] },
  { key: 'agama', label: 'Agama', kelompok: 'Identitas', tipe: 'teks', excel: ['Agama'] },

  // Rombel & Sekolah
  { key: 'rombel', label: 'Rombel Saat Ini', kelompok: 'Rombel & Sekolah', tipe: 'teks', excel: ['Rombel Saat Ini', 'Rombel'] },
  { key: 'kelas', label: 'Kelas', kelompok: 'Rombel & Sekolah', tipe: 'teks', excel: ['Kelas', 'Tingkat'] },
  { key: 'jurusan', label: 'Jurusan', kelompok: 'Rombel & Sekolah', tipe: 'teks', excel: ['Jurusan', 'Kompetensi Keahlian'] },
  { key: 'status', label: 'Status', kelompok: 'Rombel & Sekolah', tipe: 'pilihan', opsi: STATUS_SISWA, excel: ['Status', 'Status Siswa'] },
  { key: 'sekolahAsal', label: 'Sekolah Asal', kelompok: 'Rombel & Sekolah', tipe: 'teks', excel: ['Sekolah Asal'] },
  { key: 'noPesertaUn', label: 'No Peserta Ujian Nasional', kelompok: 'Rombel & Sekolah', tipe: 'teks', excel: ['No Peserta Ujian Nasional'] },
  { key: 'noSeriIjazah', label: 'No Seri Ijazah', kelompok: 'Rombel & Sekolah', tipe: 'teks', excel: ['No Seri Ijazah'] },
  { key: 'skhun', label: 'SKHUN', kelompok: 'Rombel & Sekolah', tipe: 'teks', excel: ['SKHUN'] },

  // Alamat
  { key: 'alamat', label: 'Alamat', kelompok: 'Alamat', tipe: 'panjang', excel: ['Alamat'] },
  { key: 'rt', label: 'RT', kelompok: 'Alamat', tipe: 'teks', excel: ['RT'] },
  { key: 'rw', label: 'RW', kelompok: 'Alamat', tipe: 'teks', excel: ['RW'] },
  { key: 'dusun', label: 'Dusun', kelompok: 'Alamat', tipe: 'teks', excel: ['Dusun'] },
  { key: 'kelurahan', label: 'Kelurahan', kelompok: 'Alamat', tipe: 'teks', excel: ['Kelurahan'] },
  { key: 'kecamatan', label: 'Kecamatan', kelompok: 'Alamat', tipe: 'teks', excel: ['Kecamatan'] },
  { key: 'kodePos', label: 'Kode Pos', kelompok: 'Alamat', tipe: 'teks', excel: ['Kode Pos'] },
  { key: 'jenisTinggal', label: 'Jenis Tinggal', kelompok: 'Alamat', tipe: 'teks', excel: ['Jenis Tinggal'] },
  { key: 'alatTransportasi', label: 'Alat Transportasi', kelompok: 'Alamat', tipe: 'teks', excel: ['Alat Transportasi'] },
  { key: 'lintang', label: 'Lintang', kelompok: 'Alamat', tipe: 'teks', excel: ['Lintang'] },
  { key: 'bujur', label: 'Bujur', kelompok: 'Alamat', tipe: 'teks', excel: ['Bujur'] },
  { key: 'jarakKeSekolah', label: 'Jarak Rumah ke Sekolah (KM)', kelompok: 'Alamat', tipe: 'teks', excel: ['Jarak Rumah ke Sekolah'] },

  // Kontak
  { key: 'telepon', label: 'Telepon', kelompok: 'Kontak', tipe: 'teks', excel: ['Telepon'] },
  { key: 'hp', label: 'HP', kelompok: 'Kontak', tipe: 'teks', excel: ['HP', 'No HP'] },
  { key: 'email', label: 'E-Mail', kelompok: 'Kontak', tipe: 'teks', excel: ['E-Mail', 'Email'] },
  { key: 'noWaOrtu', label: 'No WA Orang Tua', kelompok: 'Kontak', tipe: 'teks', excel: ['No WA Ortu', 'No WA', 'Whatsapp'] },

  // Data Ayah
  { key: 'ayahNama', label: 'Nama Ayah', kelompok: 'Data Ayah', tipe: 'teks', excel: ['Ayah Nama', 'Nama Ayah'] },
  { key: 'ayahTahunLahir', label: 'Tahun Lahir Ayah', kelompok: 'Data Ayah', tipe: 'teks', excel: ['Ayah Tahun Lahir'] },
  { key: 'ayahPendidikan', label: 'Jenjang Pendidikan Ayah', kelompok: 'Data Ayah', tipe: 'teks', excel: ['Ayah Jenjang Pendidikan'] },
  { key: 'ayahPekerjaan', label: 'Pekerjaan Ayah', kelompok: 'Data Ayah', tipe: 'teks', excel: ['Ayah Pekerjaan'] },
  { key: 'ayahPenghasilan', label: 'Penghasilan Ayah', kelompok: 'Data Ayah', tipe: 'teks', excel: ['Ayah Penghasilan'] },
  { key: 'ayahNik', label: 'NIK Ayah', kelompok: 'Data Ayah', tipe: 'teks', excel: ['Ayah NIK'] },

  // Data Ibu
  { key: 'ibuNama', label: 'Nama Ibu', kelompok: 'Data Ibu', tipe: 'teks', excel: ['Ibu Nama', 'Nama Ibu'] },
  { key: 'ibuTahunLahir', label: 'Tahun Lahir Ibu', kelompok: 'Data Ibu', tipe: 'teks', excel: ['Ibu Tahun Lahir'] },
  { key: 'ibuPendidikan', label: 'Jenjang Pendidikan Ibu', kelompok: 'Data Ibu', tipe: 'teks', excel: ['Ibu Jenjang Pendidikan'] },
  { key: 'ibuPekerjaan', label: 'Pekerjaan Ibu', kelompok: 'Data Ibu', tipe: 'teks', excel: ['Ibu Pekerjaan'] },
  { key: 'ibuPenghasilan', label: 'Penghasilan Ibu', kelompok: 'Data Ibu', tipe: 'teks', excel: ['Ibu Penghasilan'] },
  { key: 'ibuNik', label: 'NIK Ibu', kelompok: 'Data Ibu', tipe: 'teks', excel: ['Ibu NIK'] },

  // Data Wali
  { key: 'waliNama', label: 'Nama Wali', kelompok: 'Data Wali', tipe: 'teks', excel: ['Wali Nama', 'Nama Wali'] },
  { key: 'waliTahunLahir', label: 'Tahun Lahir Wali', kelompok: 'Data Wali', tipe: 'teks', excel: ['Wali Tahun Lahir'] },
  { key: 'waliPendidikan', label: 'Jenjang Pendidikan Wali', kelompok: 'Data Wali', tipe: 'teks', excel: ['Wali Jenjang Pendidikan'] },
  { key: 'waliPekerjaan', label: 'Pekerjaan Wali', kelompok: 'Data Wali', tipe: 'teks', excel: ['Wali Pekerjaan'] },
  { key: 'waliPenghasilan', label: 'Penghasilan Wali', kelompok: 'Data Wali', tipe: 'teks', excel: ['Wali Penghasilan'] },
  { key: 'waliNik', label: 'NIK Wali', kelompok: 'Data Wali', tipe: 'teks', excel: ['Wali NIK'] },

  // Bantuan & Kesejahteraan
  { key: 'penerimaKps', label: 'Penerima KPS', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Penerima KPS'] },
  { key: 'noKps', label: 'No. KPS', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['No KPS'] },
  { key: 'penerimaKip', label: 'Penerima KIP', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Penerima KIP'] },
  { key: 'nomorKip', label: 'Nomor KIP', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Nomor KIP'] },
  { key: 'namaDiKip', label: 'Nama di KIP', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Nama di KIP'] },
  { key: 'nomorKks', label: 'Nomor KKS', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Nomor KKS'] },
  { key: 'layakPip', label: 'Layak PIP', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Layak PIP'] },
  { key: 'alasanLayakPip', label: 'Alasan Layak PIP', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Alasan Layak PIP'] },
  { key: 'bank', label: 'Bank', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Bank'] },
  { key: 'nomorRekening', label: 'Nomor Rekening Bank', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Nomor Rekening Bank'] },
  { key: 'rekeningAtasNama', label: 'Rekening Atas Nama', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['Rekening Atas Nama'] },
  { key: 'noKk', label: 'No KK', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['No KK'] },
  { key: 'noAktaLahir', label: 'No Registrasi Akta Lahir', kelompok: 'Bantuan & Kesejahteraan', tipe: 'teks', excel: ['No Registrasi Akta Lahir'] },

  // Fisik & Keluarga
  { key: 'kebutuhanKhusus', label: 'Kebutuhan Khusus', kelompok: 'Fisik & Keluarga', tipe: 'teks', excel: ['Kebutuhan Khusus'] },
  { key: 'anakKeberapa', label: 'Anak ke-berapa', kelompok: 'Fisik & Keluarga', tipe: 'teks', excel: ['Anak ke-berapa'] },
  { key: 'jmlSaudaraKandung', label: 'Jml. Saudara Kandung', kelompok: 'Fisik & Keluarga', tipe: 'teks', excel: ['Jml Saudara Kandung'] },
  { key: 'beratBadan', label: 'Berat Badan', kelompok: 'Fisik & Keluarga', tipe: 'teks', excel: ['Berat Badan'] },
  { key: 'tinggiBadan', label: 'Tinggi Badan', kelompok: 'Fisik & Keluarga', tipe: 'teks', excel: ['Tinggi Badan'] },
  { key: 'lingkarKepala', label: 'Lingkar Kepala', kelompok: 'Fisik & Keluarga', tipe: 'teks', excel: ['Lingkar Kepala'] },
];

/** Kolom yang tetap tampil di tabel ringkas admin. Sisanya hanya di halaman detail. */
export const KOLOM_RINGKAS = [
  'nisn',
  'nis',
  'namaLengkap',
  'kelas',
  'jurusan',
  'tanggalLahir',
  'alamat',
  'noWaOrtu',
  'status',
];

/**
 * Dapodik tidak punya kolom Kelas dan Jurusan terpisah; keduanya menyatu di
 * "Rombel Saat Ini" seperti "11 TB 2", "12 TB", atau "10 TKKR". Angka depan
 * adalah tingkat, sisanya kode jurusan setelah nomor rombel dibuang.
 */
export function uraikanRombel(rombel: string): { kelas: string; jurusan: string } {
  const bersih = String(rombel ?? '').trim().replace(/\s+/g, ' ');
  if (!bersih) return { kelas: '', jurusan: '' };

  const cocok = bersih.match(/^(\d{1,2})\s+(.*)$/);
  if (!cocok) return { kelas: '', jurusan: bersih };

  return { kelas: cocok[1], jurusan: cocok[2].replace(/\s+\d+$/, '').trim() };
}
