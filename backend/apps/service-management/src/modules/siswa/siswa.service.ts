import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { DokumenSiswa, Siswa } from '../../models/SiswaModel';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import {
  isContohRow,
  pickField,
  readSheetRows,
  writeSheetBuffer,
} from '../../common/excel.util';

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
    const take = Math.min(Math.max(Number(limit) || 20, 1), 200);
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
      take: 200,
    });

    return {
      data: {
        siswa: siswa.map((item) => this.lengkapiDokumen(item)),
        total: siswa.length,
        hasMore: false,
      },
    };
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

  async importFromBuffer(buffer: Buffer) {
    const rows = await readSheetRows(buffer, [
      'NISN',
      'NIS',
      'Nama Lengkap',
      'Kelas',
      'Jurusan',
      'Alamat',
    ]);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const namaLengkap = pickField(row, ['nama lengkap', 'nama', 'namalengkap']);
      const nisn = pickField(row, ['nisn']);

      if (!namaLengkap || isContohRow(namaLengkap, nisn)) {
        skipped += 1;
        continue;
      }

      const status = pickField(row, ['status', 'status siswa']).toLowerCase();

      const payload: Partial<Siswa> = {
        namaLengkap,
        nisn,
        nis: pickField(row, ['nis']),
        kelas: pickField(row, ['kelas']),
        jurusan: pickField(row, ['jurusan']),
        tanggalLahir: pickField(row, ['tanggal lahir', 'tanggallahir']),
        alamat: pickField(row, ['alamat']),
        noWaOrtu: pickField(row, ['no wa ortu', 'nowaortu', 'no wa', 'whatsapp']),
        status: ['aktif', 'lulus', 'pindah', 'keluar'].includes(status) ? status : 'aktif',
      };

      const duplicate = payload.nisn
        ? await this.siswaRepository.findOne({ where: { nisn: payload.nisn } })
        : null;

      if (duplicate) {
        skipped += 1;
        continue;
      }

      await this.siswaRepository.save(this.siswaRepository.create(payload));
      imported += 1;
    }

    return { message: 'Import selesai', data: { imported, skipped, total: rows.length } };
  }
}
