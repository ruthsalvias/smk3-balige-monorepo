import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { STATUS_SISWA } from '../siswa-fields';

/**
 * Hanya nama lengkap dan NISN yang wajib. Semua kolom Dapodik lain boleh
 * kosong supaya admin bisa menambah siswa manual tanpa data lengkap, dan
 * supaya baris Excel yang kolomnya tidak terisi tetap bisa diimpor.
 *
 * Daftar field di sini harus sejalan dengan FIELD_SISWA di siswa-fields.ts.
 */
export class CreateSiswaDto {
  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @IsString()
  @MinLength(2, { message: 'Nama lengkap minimal 2 karakter' })
  @MaxLength(255)
  namaLengkap!: string;

  @IsString({ message: 'NISN wajib diisi' })
  @MinLength(1, { message: 'NISN wajib diisi' })
  @MaxLength(50)
  nisn!: string;

  @IsOptional()
  @IsString()
  nis?: string;

  @IsOptional()
  @IsString()
  jenisKelamin?: string;

  @IsOptional()
  @IsString()
  nik?: string;

  @IsOptional()
  @IsString()
  tempatLahir?: string;

  @IsOptional()
  @IsString()
  tanggalLahir?: string;

  @IsOptional()
  @IsString()
  agama?: string;

  @IsOptional()
  @IsString()
  rombel?: string;

  @IsOptional()
  @IsString()
  kelas?: string;

  @IsOptional()
  @IsString()
  jurusan?: string;

  @IsOptional()
  @IsString()
  sekolahAsal?: string;

  @IsOptional()
  @IsString()
  noPesertaUn?: string;

  @IsOptional()
  @IsString()
  noSeriIjazah?: string;

  @IsOptional()
  @IsString()
  skhun?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  rt?: string;

  @IsOptional()
  @IsString()
  rw?: string;

  @IsOptional()
  @IsString()
  dusun?: string;

  @IsOptional()
  @IsString()
  kelurahan?: string;

  @IsOptional()
  @IsString()
  kecamatan?: string;

  @IsOptional()
  @IsString()
  kodePos?: string;

  @IsOptional()
  @IsString()
  jenisTinggal?: string;

  @IsOptional()
  @IsString()
  alatTransportasi?: string;

  @IsOptional()
  @IsString()
  lintang?: string;

  @IsOptional()
  @IsString()
  bujur?: string;

  @IsOptional()
  @IsString()
  jarakKeSekolah?: string;

  @IsOptional()
  @IsString()
  telepon?: string;

  @IsOptional()
  @IsString()
  hp?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  noWaOrtu?: string;

  @IsOptional()
  @IsString()
  ayahNama?: string;

  @IsOptional()
  @IsString()
  ayahTahunLahir?: string;

  @IsOptional()
  @IsString()
  ayahPendidikan?: string;

  @IsOptional()
  @IsString()
  ayahPekerjaan?: string;

  @IsOptional()
  @IsString()
  ayahPenghasilan?: string;

  @IsOptional()
  @IsString()
  ayahNik?: string;

  @IsOptional()
  @IsString()
  ibuNama?: string;

  @IsOptional()
  @IsString()
  ibuTahunLahir?: string;

  @IsOptional()
  @IsString()
  ibuPendidikan?: string;

  @IsOptional()
  @IsString()
  ibuPekerjaan?: string;

  @IsOptional()
  @IsString()
  ibuPenghasilan?: string;

  @IsOptional()
  @IsString()
  ibuNik?: string;

  @IsOptional()
  @IsString()
  waliNama?: string;

  @IsOptional()
  @IsString()
  waliTahunLahir?: string;

  @IsOptional()
  @IsString()
  waliPendidikan?: string;

  @IsOptional()
  @IsString()
  waliPekerjaan?: string;

  @IsOptional()
  @IsString()
  waliPenghasilan?: string;

  @IsOptional()
  @IsString()
  waliNik?: string;

  @IsOptional()
  @IsString()
  penerimaKps?: string;

  @IsOptional()
  @IsString()
  noKps?: string;

  @IsOptional()
  @IsString()
  penerimaKip?: string;

  @IsOptional()
  @IsString()
  nomorKip?: string;

  @IsOptional()
  @IsString()
  namaDiKip?: string;

  @IsOptional()
  @IsString()
  nomorKks?: string;

  @IsOptional()
  @IsString()
  layakPip?: string;

  @IsOptional()
  @IsString()
  alasanLayakPip?: string;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsString()
  nomorRekening?: string;

  @IsOptional()
  @IsString()
  rekeningAtasNama?: string;

  @IsOptional()
  @IsString()
  noKk?: string;

  @IsOptional()
  @IsString()
  noAktaLahir?: string;

  @IsOptional()
  @IsString()
  kebutuhanKhusus?: string;

  @IsOptional()
  @IsString()
  anakKeberapa?: string;

  @IsOptional()
  @IsString()
  jmlSaudaraKandung?: string;

  @IsOptional()
  @IsString()
  beratBadan?: string;

  @IsOptional()
  @IsString()
  tinggiBadan?: string;

  @IsOptional()
  @IsString()
  lingkarKepala?: string;

  @IsOptional()
  @IsIn(STATUS_SISWA, { message: 'Status tidak dikenali' })
  status?: string;

  @IsOptional()
  @IsString()
  raporFile?: string;

  @IsOptional()
  @IsString()
  sklFile?: string;

  @IsOptional()
  @IsString()
  ijazahFile?: string;
}
