import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type JenisDokumenSiswa = 'rapor' | 'skl' | 'ijazah';

export interface DokumenSiswa {
  id: string;
  jenis: JenisDokumenSiswa;
  nama: string;
  path: string;
  ukuran: number;
  mime: string;
  diunggahPada: string;
  diunggahOleh: string;
}

@Entity('siswa')
export class Siswa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  ownerUserId!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  namaLengkap!: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  jurusan!: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  nisn!: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  nis!: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  kelas!: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  tanggalLahir!: string;

  @Column({ type: 'text', default: '' })
  alamat!: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  noWaOrtu!: string;

  @Column({ type: 'varchar', length: 20, default: 'aktif' })
  status!: string;

  // ── Kolom tambahan dari Dapodik ───────────────────────────
  // Semua opsional; yang wajib hanya namaLengkap dan nisn.

  // Jenis Kelamin
  @Column({ type: 'varchar', length: 255, default: '' })
  jenisKelamin!: string;

  // NIK
  @Column({ type: 'varchar', length: 255, default: '' })
  nik!: string;

  // Tempat Lahir
  @Column({ type: 'varchar', length: 255, default: '' })
  tempatLahir!: string;

  // Agama
  @Column({ type: 'varchar', length: 255, default: '' })
  agama!: string;

  // Rombel Saat Ini
  @Column({ type: 'varchar', length: 255, default: '' })
  rombel!: string;

  // Sekolah Asal
  @Column({ type: 'varchar', length: 255, default: '' })
  sekolahAsal!: string;

  // No Peserta Ujian Nasional
  @Column({ type: 'varchar', length: 255, default: '' })
  noPesertaUn!: string;

  // No Seri Ijazah
  @Column({ type: 'varchar', length: 255, default: '' })
  noSeriIjazah!: string;

  // SKHUN
  @Column({ type: 'varchar', length: 255, default: '' })
  skhun!: string;

  // RT
  @Column({ type: 'varchar', length: 255, default: '' })
  rt!: string;

  // RW
  @Column({ type: 'varchar', length: 255, default: '' })
  rw!: string;

  // Dusun
  @Column({ type: 'varchar', length: 255, default: '' })
  dusun!: string;

  // Kelurahan
  @Column({ type: 'varchar', length: 255, default: '' })
  kelurahan!: string;

  // Kecamatan
  @Column({ type: 'varchar', length: 255, default: '' })
  kecamatan!: string;

  // Kode Pos
  @Column({ type: 'varchar', length: 255, default: '' })
  kodePos!: string;

  // Jenis Tinggal
  @Column({ type: 'varchar', length: 255, default: '' })
  jenisTinggal!: string;

  // Alat Transportasi
  @Column({ type: 'varchar', length: 255, default: '' })
  alatTransportasi!: string;

  // Lintang
  @Column({ type: 'varchar', length: 255, default: '' })
  lintang!: string;

  // Bujur
  @Column({ type: 'varchar', length: 255, default: '' })
  bujur!: string;

  // Jarak Rumah ke Sekolah (KM)
  @Column({ type: 'varchar', length: 255, default: '' })
  jarakKeSekolah!: string;

  // Telepon
  @Column({ type: 'varchar', length: 255, default: '' })
  telepon!: string;

  // HP
  @Column({ type: 'varchar', length: 255, default: '' })
  hp!: string;

  // E-Mail
  @Column({ type: 'varchar', length: 255, default: '' })
  email!: string;

  // Nama Ayah
  @Column({ type: 'varchar', length: 255, default: '' })
  ayahNama!: string;

  // Tahun Lahir Ayah
  @Column({ type: 'varchar', length: 255, default: '' })
  ayahTahunLahir!: string;

  // Jenjang Pendidikan Ayah
  @Column({ type: 'varchar', length: 255, default: '' })
  ayahPendidikan!: string;

  // Pekerjaan Ayah
  @Column({ type: 'varchar', length: 255, default: '' })
  ayahPekerjaan!: string;

  // Penghasilan Ayah
  @Column({ type: 'varchar', length: 255, default: '' })
  ayahPenghasilan!: string;

  // NIK Ayah
  @Column({ type: 'varchar', length: 255, default: '' })
  ayahNik!: string;

  // Nama Ibu
  @Column({ type: 'varchar', length: 255, default: '' })
  ibuNama!: string;

  // Tahun Lahir Ibu
  @Column({ type: 'varchar', length: 255, default: '' })
  ibuTahunLahir!: string;

  // Jenjang Pendidikan Ibu
  @Column({ type: 'varchar', length: 255, default: '' })
  ibuPendidikan!: string;

  // Pekerjaan Ibu
  @Column({ type: 'varchar', length: 255, default: '' })
  ibuPekerjaan!: string;

  // Penghasilan Ibu
  @Column({ type: 'varchar', length: 255, default: '' })
  ibuPenghasilan!: string;

  // NIK Ibu
  @Column({ type: 'varchar', length: 255, default: '' })
  ibuNik!: string;

  // Nama Wali
  @Column({ type: 'varchar', length: 255, default: '' })
  waliNama!: string;

  // Tahun Lahir Wali
  @Column({ type: 'varchar', length: 255, default: '' })
  waliTahunLahir!: string;

  // Jenjang Pendidikan Wali
  @Column({ type: 'varchar', length: 255, default: '' })
  waliPendidikan!: string;

  // Pekerjaan Wali
  @Column({ type: 'varchar', length: 255, default: '' })
  waliPekerjaan!: string;

  // Penghasilan Wali
  @Column({ type: 'varchar', length: 255, default: '' })
  waliPenghasilan!: string;

  // NIK Wali
  @Column({ type: 'varchar', length: 255, default: '' })
  waliNik!: string;

  // Penerima KPS
  @Column({ type: 'varchar', length: 255, default: '' })
  penerimaKps!: string;

  // No. KPS
  @Column({ type: 'varchar', length: 255, default: '' })
  noKps!: string;

  // Penerima KIP
  @Column({ type: 'varchar', length: 255, default: '' })
  penerimaKip!: string;

  // Nomor KIP
  @Column({ type: 'varchar', length: 255, default: '' })
  nomorKip!: string;

  // Nama di KIP
  @Column({ type: 'varchar', length: 255, default: '' })
  namaDiKip!: string;

  // Nomor KKS
  @Column({ type: 'varchar', length: 255, default: '' })
  nomorKks!: string;

  // Layak PIP
  @Column({ type: 'varchar', length: 255, default: '' })
  layakPip!: string;

  // Alasan Layak PIP
  @Column({ type: 'text', default: '' })
  alasanLayakPip!: string;

  // Bank
  @Column({ type: 'varchar', length: 255, default: '' })
  bank!: string;

  // Nomor Rekening Bank
  @Column({ type: 'varchar', length: 255, default: '' })
  nomorRekening!: string;

  // Rekening Atas Nama
  @Column({ type: 'varchar', length: 255, default: '' })
  rekeningAtasNama!: string;

  // No KK
  @Column({ type: 'varchar', length: 255, default: '' })
  noKk!: string;

  // No Registrasi Akta Lahir
  @Column({ type: 'varchar', length: 255, default: '' })
  noAktaLahir!: string;

  // Kebutuhan Khusus
  @Column({ type: 'varchar', length: 255, default: '' })
  kebutuhanKhusus!: string;

  // Anak ke-berapa
  @Column({ type: 'varchar', length: 255, default: '' })
  anakKeberapa!: string;

  // Jml. Saudara Kandung
  @Column({ type: 'varchar', length: 255, default: '' })
  jmlSaudaraKandung!: string;

  // Berat Badan
  @Column({ type: 'varchar', length: 255, default: '' })
  beratBadan!: string;

  // Tinggi Badan
  @Column({ type: 'varchar', length: 255, default: '' })
  tinggiBadan!: string;

  // Lingkar Kepala
  @Column({ type: 'varchar', length: 255, default: '' })
  lingkarKepala!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  raporFile!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sklFile!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ijazahFile!: string;

  // Kolom *File di atas hanya menyimpan file terbaru tiap jenis (kompatibilitas lama).
  @Column({ type: 'jsonb', nullable: true })
  dokumen!: DokumenSiswa[] | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}