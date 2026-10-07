import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Op } from 'sequelize';
import SiswaModel from '../../models/SiswaModel';
import GuruModel from '../../models/GuruModel';

interface ManagementSiswa {
    id: string;
    namaLengkap?: string;
    kelas?: string;
    noWaOrtu?: string;
    nis?: string;
}

interface ManagementGuru {
    id: string;
    namaLengkap?: string;
    jabatan?: string;
    nip?: string;
}

type MasterRecord = {
    id: string;
    nama: string;
    kelas?: string;
    no_wa_ortu?: string | null;
    nis?: string | null;
    jabatan?: string;
    nip?: string | null;
};

/**
 * Menyalin data master siswa & guru dari service-management ke tabel lokal
 * m_siswa / m_guru pada db_pelanggaran.
 *
 * Surat panggilan memakai tabel lokal ini untuk dropdown "Pilih Siswa" dan
 * "Penandatangan", jadi tanpa sinkronisasi keduanya selalu kosong.
 */
@Injectable()
export class MasterSyncService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MasterSyncService.name);
    private timer?: NodeJS.Timeout;
    private menyinkron = false;

    private get managementUrl(): string {
        return (
            process.env.SERVICE_MANAGEMENT_URL ||
            'http://service-management:3005'
        ).replace(/\/+$/, '');
    }

    private get intervalMs(): number {
        const parsed = Number(process.env.MASTER_SYNC_INTERVAL_MS);
        if (Number.isFinite(parsed) && parsed >= 30_000) return parsed;
        return 300_000;
    }

    onModuleInit(): void {
        // Jalankan sekali saat start, lalu ulangi berkala agar data baru ikut terbaca.
        const mulai = () => void this.sinkronkanSemua();

        setTimeout(mulai, 2000);
        this.timer = setInterval(mulai, this.intervalMs);
        if (typeof this.timer.unref === 'function') this.timer.unref();
    }

    onModuleDestroy(): void {
        if (this.timer) clearInterval(this.timer);
    }

    async sinkronkanSemua(): Promise<void> {
        if (this.menyinkron) return;
        this.menyinkron = true;
        try {
            await this.sinkronSiswa();
            await this.sinkronGuru();
        } catch (error) {
            const pesan = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Sinkronisasi master data dilewati: ${pesan}`);
        } finally {
            this.menyinkron = false;
        }
    }

    private async ambilDariManagement<T>(resourcePath: string): Promise<T[]> {
        const headers: Record<string, string> = {};
        const secret = process.env.INTERNAL_GATEWAY_SECRET;
        if (secret) {
            headers['x-gateway-secret'] = secret;
        }

        const semua: T[] = [];
        let offset = 0;
        const limit = 200;
        let hasMore = true;

        while (hasMore) {
            const sep = resourcePath.includes('?') ? '&' : '?';
            const url = `${this.managementUrl}/api${resourcePath}${sep}limit=${limit}&offset=${offset}`;
            const res = await fetch(url, { headers });
            if (!res.ok) {
                throw new Error(`service-management ${resourcePath} mengembalikan ${res.status}`);
            }
            const isi = (await res.json()) as { data?: Record<string, any> };
            const data = isi?.data ?? {};
            const daftar = (data.siswa ?? data.guru ?? []) as T[];
            semua.push(...daftar);

            if (!data.hasMore || daftar.length === 0 || daftar.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
            }
        }

        return semua;
    }

    private async sinkronSiswa(): Promise<void> {
        const daftar = await this.ambilDariManagement<ManagementSiswa>('/siswa');

        const records: MasterRecord[] = daftar
            .filter((s) => s && s.id)
            .map((s) => ({
                id: s.id,
                nama: s.namaLengkap || 'Tanpa Nama',
                kelas: s.kelas || '',
                no_wa_ortu: s.noWaOrtu || null,
                nis: s.nis || (s as any).nisn || null,
            }));

        await this.upsert(
            SiswaModel,
            records,
            ['id', 'nama', 'kelas', 'no_wa_ortu', 'nis'],
            'm_siswa',
        );
    }

    private async sinkronGuru(): Promise<void> {
        const daftar = await this.ambilDariManagement<ManagementGuru>('/guru');

        const records: MasterRecord[] = daftar
            .filter((g) => g && g.id)
            .map((g) => ({
                id: g.id,
                nama: g.namaLengkap || 'Tanpa Nama',
                nip: g.nip || null,
                jabatan: g.jabatan || '',
            }));

        await this.upsert(
            GuruModel,
            records,
            ['id', 'nama', 'nip', 'jabatan'],
            'm_guru',
        );
    }

    /** Upsert idempoten + hapus baris yang sudah tidak ada di sumber. */
    private async upsert(
        model: { bulkCreate: Function; destroy: Function },
        records: MasterRecord[],
        fields: string[],
        label: string,
    ): Promise<void> {
        if (records.length > 0) {
            await model.bulkCreate(records, { updateOnDuplicate: fields });
        }

        const ids = records.map((r) => r.id);
        await model.destroy(
            ids.length > 0 ? { where: { id: { [Op.notIn]: ids } } } : { where: {} },
        );

        this.logger.log(`Sinkron ${label}: ${records.length} baris`);
    }
}