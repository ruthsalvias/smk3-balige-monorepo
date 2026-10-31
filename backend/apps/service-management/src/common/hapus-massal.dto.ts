import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

/**
 * Batas satu permintaan. Angkanya disamakan dengan batas pembuatan akun siswa
 * massal supaya satu angkatan hasil impor bisa dibatalkan sekali jalan.
 */
export const MAKS_HAPUS_MASSAL = 500;

export class HapusMassalDto {
  @IsArray({ message: 'Daftar ID harus berupa array' })
  @ArrayNotEmpty({ message: 'Tidak ada data yang dipilih untuk dihapus' })
  @ArrayMaxSize(MAKS_HAPUS_MASSAL, {
    message: `Maksimal ${MAKS_HAPUS_MASSAL} data sekali hapus`,
  })
  @IsUUID('all', { each: true, message: 'Ada ID yang tidak valid pada daftar' })
  ids!: string[];
}
