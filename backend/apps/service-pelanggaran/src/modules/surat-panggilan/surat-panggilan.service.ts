import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { Op } from 'sequelize';
import { CreateSuratDto } from './dto/create-surat.dto';
import { UpdateSuratDto } from './dto/update-surat.dto';
import SiswaModel from '../../models/SiswaModel';
import GuruModel from '../../models/GuruModel';
import SuratPanggilanModel, { SuratStatus } from '../../models/SuratPanggilanModel';
import { buildSuratPanggilanPdf } from '../../templates/surat-panggilan.pdf';
import { MasterSyncService } from '../master-sync/master-sync.service';

const PROFIL_SEKOLAH = {
    nama: process.env.SEKOLAH_NAMA || 'SMK Negeri 3 Balige',
    dinas: process.env.SEKOLAH_DINAS || 'Dinas Pendidikan',
    pemerintah: process.env.SEKOLAH_PEMERINTAH || 'Pemerintah Provinsi Sumatera Utara',
    alamat:
        process.env.SEKOLAH_ALAMAT ||
        'Jl. Sisingamangaraja, Balige, Kabupaten Toba, Sumatera Utara 22312',
    kontak:
        process.env.SEKOLAH_KONTAK ||
        'Telepon (0632) 21123  |  Email: info@smkn3balige.sch.id',
    kota: process.env.SEKOLAH_KOTA || 'Balige',
};

type SuratActor = {
    userId: string;
    username: string;
};

@Injectable()
export class SuratPanggilanService {
    constructor(
        @Optional() private readonly masterSyncService?: MasterSyncService
    ) {}

    private actorId(actor?: SuratActor) {
        return actor?.userId || actor?.username || null;
    }

    private async validateReferences(payload: Partial<CreateSuratDto>) {
        if (payload.id_siswa) {
            const siswa = await SiswaModel.findByPk(payload.id_siswa);
            if (!siswa) throw new BadRequestException('Siswa tidak ditemukan');
        }

        if (payload.id_penandatangan) {
            const uniqueIds = Array.from(new Set(payload.id_penandatangan));
            if (uniqueIds.length === 0) {
                throw new BadRequestException('Minimal satu penandatangan wajib dipilih');
            }

            const count = await GuruModel.count({
                where: { id: { [Op.in]: uniqueIds } },
            });

            if (count !== uniqueIds.length) {
                throw new BadRequestException('Ada penandatangan yang tidak ditemukan');
            }
        }
    }

    private async ensureUniqueNoSurat(noSurat?: string, currentId?: string) {
        if (!noSurat) return;

        const existing: any = await SuratPanggilanModel.findOne({
            where: { no_surat: noSurat },
        });

        if (existing && existing.getDataValue('id') !== currentId) {
            throw new BadRequestException('Nomor surat sudah digunakan');
        }
    }

    async getMasterSiswa() {
        const count = await SiswaModel.count();
        if (count === 0 && this.masterSyncService) {
            await this.masterSyncService.sinkronkanSemua();
        }
        const data = await SiswaModel.findAll({
            attributes: ['id', 'nama', 'kelas', 'no_wa_ortu', 'nis'],
            order: [['nama', 'ASC']],
        });
        return { status: 'success', data };
    }

    async getMasterGuru() {
        const count = await GuruModel.count();
        if (count === 0 && this.masterSyncService) {
            await this.masterSyncService.sinkronkanSemua();
        }
        const data = await GuruModel.findAll({
            attributes: ['id', 'nama', 'jabatan', 'nip'],
            order: [['nama', 'ASC']],
        });
        return { status: 'success', data };
    }

    async createSurat(payload: CreateSuratDto, actor?: SuratActor) {
        await this.validateReferences(payload);
        await this.ensureUniqueNoSurat(payload.no_surat);

        const suratBaru = await SuratPanggilanModel.create({
            id_siswa: payload.id_siswa,
            no_surat: payload.no_surat.trim(),
            permasalahan: payload.permasalahan.trim(),
            tanggal_panggilan: payload.tanggal_panggilan,
            waktu_panggilan: payload.waktu_panggilan || '09.00 WIB - Selesai',
            tempat: payload.tempat || 'Ruang BK',
            id_penandatangan: payload.id_penandatangan,
            status: SuratStatus.TERBIT,
            created_by: this.actorId(actor),
        });

        return {
            status: 'success',
            message: 'Surat Panggilan berhasil dibuat',
            data: suratBaru,
        };
    }

    async updateSurat(id: string, payload: UpdateSuratDto, actor?: SuratActor) {
        const surat = await SuratPanggilanModel.findByPk(id);
        if (!surat) throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);

        await this.validateReferences(payload);
        await this.ensureUniqueNoSurat(payload.no_surat, id);

        await surat.update({
            ...payload,
            no_surat: payload.no_surat?.trim(),
            permasalahan: payload.permasalahan?.trim(),
            updated_by: this.actorId(actor),
        });

        return {
            status: 'success',
            message: 'Surat Panggilan berhasil diperbarui',
            data: surat,
        };
    }

    async getAllSurat() {
        const data = await SuratPanggilanModel.findAll({
            order: [['tanggal_panggilan', 'DESC']],
        });
        return { status: 'success', data };
    }

    async deleteSurat(id: string) {
        const deletedCount = await SuratPanggilanModel.destroy({ where: { id } });
        if (deletedCount === 0) {
            throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);
        }
        return { status: 'success', message: 'Surat panggilan berhasil dihapus' };
    }

    async generatePdf(id: string): Promise<{ buffer: Buffer; fileName: string }> {
        const surat = await SuratPanggilanModel.findByPk(id);
        if (!surat) throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);

        const siswa = await SiswaModel.findByPk(surat.getDataValue('id_siswa'));
        if (!siswa) throw new NotFoundException('Data siswa tidak ditemukan');

        const arrIdPenandatangan = surat.getDataValue('id_penandatangan') || [];
        const gurus = await GuruModel.findAll({
            where: { id: { [Op.in]: arrIdPenandatangan } },
        });

        const penandatanganTerurut = arrIdPenandatangan
            .map((guruId: string) => {
                const guru = gurus.find((g) => g.getDataValue('id') === guruId);
                return guru ? guru.toJSON() : null;
            })
            .filter(Boolean);

        const dataTemplate = {
            no_surat: surat.getDataValue('no_surat'),
            nama_siswa: siswa.getDataValue('nama'),
            kelas: siswa.getDataValue('kelas'),
            tanggal_panggilan: surat.getDataValue('tanggal_panggilan'),
            waktu_panggilan: surat.getDataValue('waktu_panggilan'),
            tempat: surat.getDataValue('tempat'),
            permasalahan: surat.getDataValue('permasalahan'),
            penandatangan: penandatanganTerurut,
            sekolah: PROFIL_SEKOLAH,
        };

        const buffer = await buildSuratPanggilanPdf(dataTemplate);
        const namaMentah = siswa.getDataValue('nama') || 'Siswa_Tidak_Diketahui';
        const namaBersih = namaMentah.replace(/[^a-zA-Z0-9]/g, '_');

        return { buffer, fileName: `Surat_Panggilan_${namaBersih}.pdf` };
    }

    async generateWhatsappLink(id: string, actor?: SuratActor) {
        const surat = await SuratPanggilanModel.findByPk(id);
        if (!surat) throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);

        const siswa = await SiswaModel.findByPk(surat.getDataValue('id_siswa'));
        if (!siswa) throw new NotFoundException('Data siswa tidak ditemukan');

        const namaSiswa = siswa.getDataValue('nama');
        let noWa = siswa.getDataValue('no_wa_ortu');

        if (!noWa) {
            return { status: 'error', message: 'Nomor WhatsApp orang tua belum terdaftar.' };
        }

        noWa = noWa.replace(/\D/g, '');
        if (noWa.startsWith('0')) noWa = `62${noWa.substring(1)}`;

        const pesan = `Yth. Bapak/Ibu Orang Tua/Wali dari siswa/i *${namaSiswa}*,

Dengan hormat,
Sehubungan dengan perlunya penyelesaian masalah akademik/kedisiplinan anak kita, kami mengharapkan kehadiran Bapak/Ibu pada:

Tanggal: ${surat.getDataValue('tanggal_panggilan')}
Waktu: ${surat.getDataValue('waktu_panggilan')}
Tempat: ${surat.getDataValue('tempat')}

Mengingat pentingnya pertemuan ini, kami sangat mengharapkan kehadiran Bapak/Ibu tepat waktu. Surat panggilan resmi (PDF) akan kami lampirkan setelah pesan ini.

Atas perhatian dan kerja samanya, kami ucapkan terima kasih.`;

        await surat.update({
            status: SuratStatus.DIKIRIM,
            updated_by: this.actorId(actor),
        });

        return {
            status: 'success',
            message: 'Link WhatsApp berhasil dibuat',
            data: {
                nama_siswa: namaSiswa,
                no_wa_tujuan: noWa,
                link_whatsapp: `https://wa.me/${noWa}?text=${encodeURIComponent(pesan)}`,
            },
        };
    }

    async markDone(id: string, actor?: SuratActor) {
        const surat = await SuratPanggilanModel.findByPk(id);
        if (!surat) throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);

        await surat.update({
            status: SuratStatus.SELESAI,
            updated_by: this.actorId(actor),
        });

        return { status: 'success', message: 'Surat panggilan ditandai selesai', data: surat };
    }

    async cancel(id: string, actor?: SuratActor) {
        const surat = await SuratPanggilanModel.findByPk(id);
        if (!surat) throw new NotFoundException(`Surat dengan ID ${id} tidak ditemukan`);

        await surat.update({
            status: SuratStatus.DIBATALKAN,
            updated_by: this.actorId(actor),
        });

        return { status: 'success', message: 'Surat panggilan dibatalkan', data: surat };
    }
}