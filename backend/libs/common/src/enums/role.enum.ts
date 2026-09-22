/**
 * Daftar peran pengguna SMK3 Balige.
 * Nilainya disimpan apa adanya pada kolom `roles` tabel `pengguna`
 * dan ikut dimasukkan ke dalam token login.
 */
export enum Role {
  MASTER_ADMIN = 'master_admin',
  ADMIN = 'admin',
  GURU = 'guru',
  SISWA = 'siswa',
}
