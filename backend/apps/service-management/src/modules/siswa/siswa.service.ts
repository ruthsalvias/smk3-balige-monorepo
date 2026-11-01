import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { DokumenSiswa, Siswa } from '../../models/SiswaModel';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import {
  isContohRow,
  pickField,
  readSheetRows,
  writeSheetBuffer,
} from '../../common/excel.util';
import { FIELD_SISWA, STATUS_SISWA, uraikanRombel } from './siswa-fields';

export type SiswaFileType = 'rapor' | 'skl' | 'ijazah';

const FILE_COLUMN: Record<SiswaFileType, keyof Siswa> = {
  rapor: 'raporFile',
  skl: 'sklFile',
  ijazah: 'ijazahFile',
};

export interface BerkasUnggahan {
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class SiswaService {
  constructor(
    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,
  ) {}

  /** File lama yang hanya tersimpan di kolom *File ditampilkan sebagai entri dokumen. */
  private lengkapiDokumen(siswa: Siswa): Siswa {
    if (Array.isArray(siswa.dokumen) && siswa.dokumen.length) return siswa;

    const warisan: DokumenSiswa[] = [];
    (Object.keys(FILE_COLUMN) as SiswaFileType[]).forEach((jenis) => {
      const path = (siswa as unknown as Record<string, unknown>)[
        FILE_COLUMN[jenis] as string
      ] as string | null;
      if (!path) return;
      warisan.push({
        id: `warisan-${jenis}`,
        jenis,
        nama: path.split('/').pop() as string,
        path,
        ukuran: 0,
        mime: '',
        diunggahPada: siswa.updatedAt?.toISOString?.() || new Date().toISOString(),
        diunggahOleh: '',
      });
    });

    siswa.dokumen = warisan;
    return siswa;
  }

  async create(createSiswaDto: CreateSiswaDto): Promise<Siswa> {
    const newSiswa = this.siswaRepository.create(createSiswaDto);
    return await this.siswaRepository.save(newSiswa);
  }

  async findAll(limit = 20, offset = 0) {
    const take = Math.min(Math.max(Number(limit) || 20, 1), 1000);
    const skip = Math.max(Number(offset) || 0, 0);

    const [siswa, total] = await this.siswaRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      data: {
        siswa: siswa.map((item) => this.lengkapiDokumen(item)),
        total,
        limit: take,
        offset: skip,
        hasMore: skip + siswa.length < total,
      },
    };
  }

  async search(params: { q?: string; kelas?: string; jurusan?: string; status?: string }) {
    const where: FindOptionsWhere<Siswa>[] = [];
    const base: FindOptionsWhere<Siswa> = {};

    if (params.kelas) base.kelas = params.kelas;
    if (params.jurusan) base.jurusan = params.jurusan;
    if (params.status) base.status = params.status;

    if (params.q) {
      where.push({ ...base, namaLengkap: ILike(`%${params.q}%`) });
      where.push({ ...base, nisn: ILike(`%${params.q}%`) });
      where.push({ ...base, nis: ILike(`%${params.q}%`) });
    } else {
      where.push(base);
    }

    const siswa = await this.siswaRepository.find({
      where,
      order: { namaLengkap: 'ASC' },
      take: 1000,
    });

    return {
      data: {
        siswa: siswa.map((item) => this.lengkapiDokumen(item)),
        total: siswa.length,
        hasMore: false,
      },
    };
  }

  /** Daftar kelas dan jurusan yang benar-benar ada, untuk isi dropdown penyaring. */
  async opsiFilter() {
    const baris = await this.siswaRepository
      .createQueryBuilder('siswa')
      .select('siswa.kelas', 'kelas')
      .addSelect('siswa.jurusan', 'jurusan')
      .getRawMany<{ kelas: string; jurusan: string }>();

    const bersih = (nilai: string) => String(nilai ?? '').trim();
    const kelas = [...new Set(baris.map((b) => bersih(b.kelas)).filter(Boolean))].sort();
    const jurusan = [...new Set(baris.map((b) => bersih(b.jurusan)).filter(Boolean))].sort();

    return { data: { kelas, jurusan } };
  }

  /**
   * Daftar ringkas untuk pembuatan akun massal: hanya kolom yang dibutuhkan,
   * tanpa batas 200 seperti findAll, karena semua siswa harus ikut terbaca.
   */
  async ringkas(params: { kelas?: string; jurusan?: string }) {
    const where: FindOptionsWhere<Siswa> = {};
    if (params.kelas) where.kelas = params.kelas;
    if (params.jurusan) where.jurusan = params.jurusan;

    const siswa = await this.siswaRepository.find({
      where,
      select: ['id', 'nisn', 'nis', 'namaLengkap', 'kelas', 'jurusan', 'status'],
      order: { namaLengkap: 'ASC' },
    });

    return { data: { siswa, total: siswa.length } };
  }

  async stats() {
    const [total, aktif, lulus] = await Promise.all([
      this.siswaRepository.count(),
      this.siswaRepository.count({ where: { status: 'aktif' } }),
      this.siswaRepository.count({ where: { status: 'lulus' } }),
    ]);

    return { data: { total, aktif, lulus } };
  }

  async findOne(id: string): Promise<Siswa> {
    const siswa = await this.siswaRepository.findOne({ where: { id } });
    if (!siswa) throw new NotFoundException(`Siswa dengan ID ${id} tidak ditemukan`);
    return this.lengkapiDokumen(siswa);
  }

  /** Mencari record siswa milik pengguna yang sedang login (username akun = NIS). */
  async findByPengguna(userId?: string, username?: string): Promise<Siswa> {
    const where: FindOptionsWhere<Siswa>[] = [];
    if (userId) where.push({ ownerUserId: userId });
    if (username) {
      where.push({ nis: username });
      where.push({ nisn: username });
    }
    if (!where.length) throw new NotFoundException('Data siswa tidak ditemukan');

    const siswa = await this.siswaRepository.findOne({ where });
    if (!siswa) throw new NotFoundException('Data siswa untuk akun ini tidak ditemukan');

    // Simpan tautan ke akun Keycloak supaya pencarian berikutnya langsung tepat.
    if (userId && siswa.ownerUserId !== userId) {
      siswa.ownerUserId = userId;
      await this.siswaRepository.save(siswa);
    }
    return this.lengkapiDokumen(siswa);
  }

  async update(id: string, updateSiswaDto: UpdateSiswaDto): Promise<Siswa> {
    const siswa = await this.findOne(id);
    Object.assign(siswa, updateSiswaDto);
    return await this.siswaRepository.save(siswa);
  }

  async remove(id: string) {
    const siswa = await this.findOne(id);
    await this.siswaRepository.remove(siswa);
    return { message: 'Siswa berhasil dihapus', data: { id } };
  }

  /**
   * Menghapus banyak siswa sekaligus, dipakai untuk membatalkan hasil impor
   * yang salah. ID yang tidak ditemukan dilaporkan balik, bukan menggagalkan
   * seluruh permintaan, supaya daftar yang sudah usang di layar tetap terproses.
   */
  async hapusMassal(ids: string[]) {
    const unik = Array.from(new Set(ids));
    const siswa = await this.siswaRepository.find({ where: { id: In(unik) } });

    const ditemukan = new Set(siswa.map((item) => item.id));
    const tidakDitemukan = unik.filter((id) => !ditemukan.has(id));

    if (siswa.length > 0) {
      await this.siswaRepository.remove(siswa);
    }

    return {
      message: `${siswa.length} data siswa berhasil dihapus`,
      data: {
        diminta: unik.length,
        dihapus: siswa.length,
        tidakDitemukan,
      },
    };
  }

  /** Menambahkan satu atau beberapa berkas ke jenis dokumen tertentu. */
  async attachFiles(
    id: string,
    type: SiswaFileType,
    files: BerkasUnggahan[],
    pengunggah = '',
  ) {
    const column = FILE_COLUMN[type];
    if (!column) throw new BadRequestException('Tipe file tidak valid');

    const siswa = await this.findOne(id);
    const daftar = [...(siswa.dokumen ?? [])];

    files.forEach((file) => {
      daftar.push({
        id: randomUUID(),
        jenis: type,
        nama: file.originalname,
        path: `/uploads/siswa/${file.filename}`,
        ukuran: file.size,
        mime: file.mimetype,
        diunggahPada: new Date().toISOString(),
        diunggahOleh: pengunggah,
      });
    });

    siswa.dokumen = daftar;
    (siswa as unknown as Record<string, unknown>)[column as string] =
      [...daftar].reverse().find((item) => item.jenis === type)?.path ?? null;

    const saved = await this.siswaRepository.save(siswa);
    return { message: 'File berhasil diunggah', data: saved };
  }

  async getDokumen(id: string, dokumenId: string): Promise<DokumenSiswa> {
    const siswa = await this.findOne(id);
    return this.cariDokumen(siswa, dokumenId);
  }

  cariDokumen(siswa: Siswa, dokumenId: string): DokumenSiswa {
    const dokumen = (siswa.dokumen ?? []).find((item) => item.id === dokumenId);
    if (!dokumen) throw new NotFoundException('Dokumen tidak ditemukan');
    return dokumen;
  }

  async hapusDokumen(id: string, dokumenId: string) {
    const siswa = await this.findOne(id);
    const dokumen = this.cariDokumen(siswa, dokumenId);

    const sisa = (siswa.dokumen ?? []).filter((item) => item.id !== dokumenId);
    siswa.dokumen = sisa;
    (siswa as unknown as Record<string, unknown>)[FILE_COLUMN[dokumen.jenis] as string] =
      [...sisa].reverse().find((item) => item.jenis === dokumen.jenis)?.path ?? null;

    await this.siswaRepository.save(siswa);

    // Berkas fisik hanya dihapus bila tidak dipakai entri lain.
    const masihDipakai = sisa.some((item) => item.path === dokumen.path);
    return { message: 'Dokumen berhasil dihapus', data: { dokumen, masihDipakai } };
  }

  async getFilePath(id: string, type: SiswaFileType): Promise<string> {
    const column = FILE_COLUMN[type];
    if (!column) throw new BadRequestException('Tipe file tidak valid');

    const siswa = await this.findOne(id);
    const value = (siswa as unknown as Record<string, unknown>)[column as string] as
      | string
      | null;
    if (!value) throw new NotFoundException(`File ${type} belum diunggah`);
    return value;
  }

  async exportToBuffer(search?: string): Promise<Buffer> {
    const rows = search
      ? (await this.search({ q: search })).data.siswa
      : await this.siswaRepository.find({ order: { namaLengkap: 'ASC' } });

    return writeSheetBuffer(
      'Siswa',
      rows.map((item, index) => ({
        No: index + 1,
        NISN: item.nisn,
        NIS: item.nis,
        'Nama Lengkap': item.namaLengkap,
        Kelas: item.kelas,
        Jurusan: item.jurusan,
        'Tanggal Lahir': item.tanggalLahir,
        Alamat: item.alamat,
        'No WA Ortu': item.noWaOrtu,
        Status: item.status,
      })),
    );
  }

  /**
   * Impor dari Excel. Mendukung template sederhana lama maupun export Dapodik
   * ("Daftar Peserta Didik") yang punya 60+ kolom dan header dua baris.
   *
   * Dapodik tidak memuat kolom Kelas dan Jurusan; keduanya diuraikan dari
   * "Rombel Saat Ini" supaya penyaringan per kelas/jurusan tetap bisa dipakai.
   */
  async importFromBuffer(buffer: Buffer) {
    const rows = await readSheetRows(buffer, [
      'NISN',
      'NIS',
      'NIPD',
      'Nama',
      'Nama Lengkap',
      'Alamat',
      'Rombel Saat Ini',
    ]);

    let imported = 0;
    let skipped = 0;
    let tanpaNisn = 0;
    const duplikat: string[] = [];

    for (const row of rows) {
      const payload: Record<string, string> = {};
      for (const field of FIELD_SISWA) {
        const nilai = pickField(row, field.excel);
        if (nilai) payload[field.key] = nilai;
      }

      const namaLengkap = payload.namaLengkap ?? '';
      const nisn = payload.nisn ?? '';

      // Baris kosong atau baris contoh bawaan template tidak ikut masuk.
      if (!namaLengkap || isContohRow(namaLengkap, nisn)) {
        skipped += 1;
        continue;
      }

      // Kelas dan jurusan menyatu di rombel pada export Dapodik.
      if (payload.rombel && (!payload.kelas || !payload.jurusan)) {
        const { kelas, jurusan } = uraikanRombel(payload.rombel);
        if (!payload.kelas && kelas) payload.kelas = kelas;
        if (!payload.jurusan && jurusan) payload.jurusan = jurusan;
      }

      const status = (payload.status ?? '').toLowerCase();
      payload.status = STATUS_SISWA.includes(status) ? status : 'aktif';

      // Tanpa NISN baris tetap diimpor supaya datanya tidak hilang, tapi
      // dihitung terpisah karena belum bisa dibuatkan akun.
      if (!nisn) {
        tanpaNisn += 1;
      } else {
        const duplicate = await this.siswaRepository.findOne({ where: { nisn } });
        if (duplicate) {
          skipped += 1;
          duplikat.push(namaLengkap);
          continue;
        }
      }

      await this.siswaRepository.save(this.siswaRepository.create(payload as Partial<Siswa>));
      imported += 1;
    }

    const catatan: string[] = [`${imported} siswa masuk`];
    if (skipped > 0) catatan.push(`${skipped} dilewati`);
    if (tanpaNisn > 0) catatan.push(`${tanpaNisn} tanpa NISN`);

    return {
      message: `Import selesai: ${catatan.join(', ')}.`,
      data: {
        imported,
        skipped,
        tanpaNisn,
        total: rows.length,
        duplikat: duplikat.slice(0, 20),
      },
    };
  }
}
