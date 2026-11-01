import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
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

  /**
   * Menghapus banyak guru sekaligus, dipakai untuk membatalkan hasil impor
   * yang salah. ID yang tidak ditemukan dilaporkan balik, bukan menggagalkan
   * seluruh permintaan, supaya daftar yang sudah usang di layar tetap terproses.
   */
  async hapusMassal(ids: string[]) {
    const unik = Array.from(new Set(ids));
    const guru = await this.guruRepository.find({ where: { id: In(unik) } });

    const ditemukan = new Set(guru.map((item) => item.id));
    const tidakDitemukan = unik.filter((id) => !ditemukan.has(id));

    if (guru.length > 0) {
      await this.guruRepository.remove(guru);
    }

    return {
      message: `${guru.length} data guru berhasil dihapus`,
      data: {
        diminta: unik.length,
        dihapus: guru.length,
        tidakDitemukan,
      },
    };
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

  /**
   * Membaca berkas Excel dan menentukan nasib tiap baris tanpa menyimpan
   * apa pun. Dipakai bersama oleh pratinjau dan impor sungguhan, sehingga
   * yang dilihat admin di layar persis sama dengan yang akan tersimpan.
   */
  private async bacaBerkasImpor(buffer: Buffer) {
    const rows = await readSheetRows(buffer, [
      'NIP',
      'Nama Lengkap',
      'Mata Pelajaran',
      'Jabatan',
      'Alamat',
    ]);

    const siap: Partial<Guru>[] = [];
    const duplikat: { nama: string; nip: string }[] = [];
    let dilewati = 0;

    const nipDiBerkas = new Set<string>();
    const nipTerpakai = new Set(
      (await this.guruRepository.find({ select: ['nip'] }))
        .map((item) => String(item.nip ?? '').trim().toLowerCase())
        .filter(Boolean),
    );

    for (const row of rows) {
      const namaLengkap = pickField(row, ['nama lengkap', 'nama', 'namalengkap']);
      const nip = pickField(row, ['nip']);

      if (!namaLengkap || isContohRow(namaLengkap, nip)) {
        dilewati += 1;
        continue;
      }

      const kunci = nip.trim().toLowerCase();
      if (kunci && (nipTerpakai.has(kunci) || nipDiBerkas.has(kunci))) {
        duplikat.push({ nama: namaLengkap, nip });
        continue;
      }
      if (kunci) nipDiBerkas.add(kunci);

      siap.push({
        namaLengkap,
        nip,
        mataPelajaran: pickField(row, ['mata pelajaran', 'matapelajaran', 'mapel']),
        jabatan: pickField(row, ['jabatan']),
        anakWali: pickField(row, ['anak wali', 'anakwali', 'wali kelas']),
        noTelepon: pickField(row, ['no telepon', 'notelepon', 'telepon', 'hp']),
        alamat: pickField(row, ['alamat']),
      });
    }

    return { totalBaris: rows.length, siap, duplikat, dilewati };
  }

  /** Ringkasan plus contoh baris untuk ditampilkan sebelum admin menyetujui. */
  async pratinjauImport(buffer: Buffer) {
    const hasil = await this.bacaBerkasImpor(buffer);

    return {
      message: 'Pratinjau siap',
      data: {
        ringkasan: {
          totalBaris: hasil.totalBaris,
          akanMasuk: hasil.siap.length,
          duplikat: hasil.duplikat.length,
          dilewati: hasil.dilewati,
        },
        contoh: hasil.siap.slice(0, 50).map((g) => ({
          namaLengkap: g.namaLengkap ?? '',
          nip: g.nip ?? '',
          mataPelajaran: g.mataPelajaran ?? '',
          jabatan: g.jabatan ?? '',
          noTelepon: g.noTelepon ?? '',
          alamat: g.alamat ?? '',
        })),
        duplikat: hasil.duplikat.slice(0, 20),
      },
    };
  }

  async importFromBuffer(buffer: Buffer) {
    const hasil = await this.bacaBerkasImpor(buffer);

    if (hasil.siap.length > 0) {
      await this.guruRepository.save(
        hasil.siap.map((payload) => this.guruRepository.create(payload)),
        { chunk: 100 },
      );
    }

    const catatan: string[] = [`${hasil.siap.length} guru masuk`];
    if (hasil.duplikat.length > 0) catatan.push(`${hasil.duplikat.length} duplikat dilewati`);
    if (hasil.dilewati > 0) catatan.push(`${hasil.dilewati} baris tidak terbaca`);

    return {
      message: `Import selesai: ${catatan.join(', ')}.`,
      data: {
        imported: hasil.siap.length,
        skipped: hasil.duplikat.length + hasil.dilewati,
        total: hasil.totalBaris,
        duplikat: hasil.duplikat.slice(0, 20).map((d) => d.nama),
      },
    };
  }
}
