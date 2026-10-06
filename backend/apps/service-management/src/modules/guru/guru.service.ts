import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Guru } from '../../models/GuruModel';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import {
  isContohRow,
  pickField,
  readSheetRows,
  writeSheetBuffer,
} from '../../common/excel.util';

@Injectable()
export class GuruService {
  constructor(
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,
  ) {}

  async create(createGuruDto: CreateGuruDto): Promise<Guru> {
    const newGuru = this.guruRepository.create(createGuruDto);
    return await this.guruRepository.save(newGuru);
  }

  async findAll(limit = 20, offset = 0) {
    const take = Math.min(Math.max(Number(limit) || 20, 1), 200);
    const skip = Math.max(Number(offset) || 0, 0);

    const [guru, total] = await this.guruRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      data: {
        guru,
        total,
        limit: take,
        offset: skip,
        hasMore: skip + guru.length < total,
      },
    };
  }

  async search(params: { q?: string; mataPelajaran?: string; jabatan?: string }) {
    const where: FindOptionsWhere<Guru>[] = [];
    const base: FindOptionsWhere<Guru> = {};

    if (params.mataPelajaran) base.mataPelajaran = params.mataPelajaran;
    if (params.jabatan) base.jabatan = params.jabatan;

    if (params.q) {
      where.push({ ...base, namaLengkap: ILike(`%${params.q}%`) });
      where.push({ ...base, nip: ILike(`%${params.q}%`) });
    } else {
      where.push(base);
    }

    const guru = await this.guruRepository.find({
      where,
      order: { namaLengkap: 'ASC' },
      take: 200,
    });

    return { data: { guru, total: guru.length, hasMore: false } };
  }

  async total() {
    const total = await this.guruRepository.count();
    return { data: { total } };
  }

  async findOne(id: string): Promise<Guru> {
    const guru = await this.guruRepository.findOne({ where: { id } });
    if (!guru) throw new NotFoundException(`Guru dengan ID ${id} tidak ditemukan`);
    return guru;
  }

  async update(id: string, updateGuruDto: UpdateGuruDto): Promise<Guru> {
    const guru = await this.findOne(id);
    Object.assign(guru, updateGuruDto);
    return await this.guruRepository.save(guru);
  }

  async remove(id: string) {
    const guru = await this.findOne(id);
    await this.guruRepository.remove(guru);
    return { message: 'Guru berhasil dihapus', data: { id } };
  }

  async exportToBuffer(): Promise<Buffer> {
    const rows = await this.guruRepository.find({ order: { namaLengkap: 'ASC' } });

    return writeSheetBuffer(
      'Guru',
      rows.map((item, index) => ({
        No: index + 1,
        NIP: item.nip,
        'Nama Lengkap': item.namaLengkap,
        'Mata Pelajaran': item.mataPelajaran,
        Jabatan: item.jabatan,
        'Anak Wali': item.anakWali,
        'No Telepon': item.noTelepon,
        Alamat: item.alamat,
      })),
    );
  }

  async importFromBuffer(buffer: Buffer) {
    const rows = await readSheetRows(buffer, [
      'NIP',
      'Nama Lengkap',
      'Mata Pelajaran',
      'Jabatan',
      'Alamat',
    ]);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const namaLengkap = pickField(row, ['nama lengkap', 'nama', 'namalengkap']);
      const nip = pickField(row, ['nip']);

      if (!namaLengkap || isContohRow(namaLengkap, nip)) {
        skipped += 1;
        continue;
      }

      const payload: Partial<Guru> = {
        namaLengkap,
        nip,
        mataPelajaran: pickField(row, ['mata pelajaran', 'matapelajaran', 'mapel']),
        jabatan: pickField(row, ['jabatan']),
        anakWali: pickField(row, ['anak wali', 'anakwali', 'wali kelas']),
        noTelepon: pickField(row, ['no telepon', 'notelepon', 'telepon', 'hp']),
        alamat: pickField(row, ['alamat']),
      };

      const duplicate = payload.nip
        ? await this.guruRepository.findOne({ where: { nip: payload.nip } })
        : null;

      if (duplicate) {
        skipped += 1;
        continue;
      }

      await this.guruRepository.save(this.guruRepository.create(payload));
      imported += 1;
    }

    return { message: 'Import selesai', data: { imported, skipped, total: rows.length } };
  }
}
