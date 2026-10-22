import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Op } from 'sequelize';
import PortofolioModel, { PortfolioStatus } from '../../models/PortofolioModel';
import { CreatePortfolioDto } from './dto/create-portofolio.dto';
import { UpdatePortfolioDto } from './dto/update-portofolio.dto';
import { QueryPortfolioDto } from './dto/query-portofolio.dto';

export type PortfolioActor = {
    userId: string;
    username: string;
    roles?: string[];
};

@Injectable()
export class PortofolioService {

    private requireActor(actor: PortfolioActor) {
        if (!actor?.userId) {
            throw new UnauthorizedException('User tidak terautentikasi');
        }
        return actor;
    }

    private normalizeRow(portfolio: any) {
        const plain = typeof portfolio.get === 'function'
            ? portfolio.get({ plain: true })
            : portfolio;

        const { ownerUserId, reviewedBy, ...safeData } = plain as Record<string, unknown>;
        return safeData;
    }

    private async findOwnedPortfolio(id: number, ownerUserId: string) {
        const portfolio: any = await PortofolioModel.findByPk(id);

        if (!portfolio) {
            throw new NotFoundException(`Portofolio dengan ID ${id} tidak ditemukan`);
        }

        if (!portfolio.ownerUserId || portfolio.ownerUserId !== ownerUserId) {
            throw new ForbiddenException('Anda hanya dapat mengelola portofolio milik sendiri');
        }

        return portfolio;
    }

    private buildWhere(query: QueryPortfolioDto) {
        const where: any = {};

        if (query.major) where.major = query.major;
        if (query.category) where.category = query.category;
        if (query.skill) where.skill = query.skill;
        if (query.ownerUserId) where.ownerUserId = query.ownerUserId;

        if (query.search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${query.search}%` } },
                { description: { [Op.iLike]: `%${query.search}%` } },
                { studentName: { [Op.iLike]: `%${query.search}%` } },
            ];
        }

        return where;
    }

    // --- CRUD Transaksi ---

    private async resolveStudentName(candidateName?: string, username?: string): Promise<string> {
        let name = (candidateName || '').trim();
        if (name && name !== username) {
            return name;
        }

        if (username) {
            try {
                const managementUrl = process.env.SERVICE_MANAGEMENT_URL || 'http://service-management:3005';
                const secret = process.env.INTERNAL_GATEWAY_SECRET || '';
                const res = await fetch(`${managementUrl.replace(/\/+$/, '')}/api/siswa/search?q=${encodeURIComponent(username)}`, {
                    headers: { 'x-gateway-secret': secret },
                });
                if (res.ok) {
                    const json = (await res.json()) as any;
                    const list = json?.data?.siswa || [];
                    const found = list.find((s: any) => s.nis === username || s.nisn === username);
                    if (found?.namaLengkap) {
                        return found.namaLengkap;
                    }
                }
            } catch {
                // abaikan jika gagal lookup
            }
        }

        return name || username || '';
    }

   // 1. Tambah Portofolio (Khusus Siswa / Logged-in User)
    async create(payload: CreatePortfolioDto, actor: PortfolioActor, imagePath?: string) {
        const user = this.requireActor(actor);
        const studentName = await this.resolveStudentName(payload.studentName, user.username);

        const dataBaru = await PortofolioModel.create({
            title: payload.title,
            description: payload.description,
            studentName,
            ownerUserId: user.userId,
            ownerUsername: user.username || studentName,
            major: payload.major ?? null,
            category: payload.category ?? null,
            skill: payload.skill ?? null,
            image: imagePath ?? payload.image ?? null,
            status: PortfolioStatus.PUBLISHED, // Langsung dapat dilihat publik
        });

        return {
            status: 'success',
            message: 'Portofolio berhasil dibuat',
            data: this.normalizeRow(dataBaru),
        };
    }

    private async enrichStudentNames(rows: any[]): Promise<any[]> {
        const needsLookup = rows.filter((r) => {
            const row = typeof r?.get === 'function' ? r.get({ plain: true }) : r;
            const sName = (row?.studentName || '').trim();
            const uName = (row?.ownerUsername || '').trim();
            return !sName || sName === uName;
        });

        if (needsLookup.length === 0) return rows;

        try {
            const managementUrl = process.env.SERVICE_MANAGEMENT_URL || 'http://service-management:3005';
            const secret = process.env.INTERNAL_GATEWAY_SECRET || '';
            const res = await fetch(`${managementUrl.replace(/\/+$/, '')}/api/siswa?limit=200`, {
                headers: { 'x-gateway-secret': secret },
            });
            if (res.ok) {
                const json = (await res.json()) as any;
                const siswaList = json?.data?.siswa || [];
                const mapByNis = new Map<string, string>();
                for (const s of siswaList) {
                    if (s.nis) mapByNis.set(s.nis, s.namaLengkap);
                    if (s.nisn) mapByNis.set(s.nisn, s.namaLengkap);
                }
                for (const r of rows) {
                    const row = typeof r?.get === 'function' ? r.get({ plain: true }) : r;
                    const sName = (row?.studentName || '').trim();
                    const uName = (row?.ownerUsername || '').trim();
                    if (!sName || sName === uName) {
                        const realName = mapByNis.get(uName);
                        if (realName) {
                            if (typeof r.setDataValue === 'function') {
                                r.setDataValue('studentName', realName);
                            } else {
                                r.studentName = realName;
                            }
                            PortofolioModel.update({ studentName: realName }, { where: { id: row.id } }).catch(() => {});
                        }
                    }
                }
            }
        } catch {
            // abaikan jika lookup gagal
        }

        return rows;
    }

    // 2. Public: Lihat Semua Portofolio (Dengan Filter & Pagination)
    async findAll(query: QueryPortfolioDto = {}) {
        const page = Math.max(Number(query.page ?? 1), 1);
        const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 50);

        const { rows, count } = await PortofolioModel.findAndCountAll({
            where: this.buildWhere(query),
            order: [['created_at', 'DESC']],
            offset: (page - 1) * limit,
            limit,
        });

        const enriched = await this.enrichStudentNames(rows);

        return {
            status: 'success',
            data: enriched.map((item) => this.normalizeRow(item)),
            meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
        };
    }

    // 3. Khusus Siswa: Lihat Daftar Portofolio Milik Sendiri
    async findMine(query: QueryPortfolioDto = {}, actor: PortfolioActor) {
        const user = this.requireActor(actor);
        const page = Math.max(Number(query.page ?? 1), 1);
        const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 50);

        const where: any = {
            ownerUserId: user.userId,
            ...this.buildWhere(query),
        };

        const { rows, count } = await PortofolioModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            offset: (page - 1) * limit,
            limit,
        });

        const enriched = await this.enrichStudentNames(rows);

        return {
            status: 'success',
            data: enriched.map((item) => this.normalizeRow(item)),
            meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
        };
    }

    // 4. Public: Lihat Detail 1 Portofolio
    async findOne(id: number) {
        const data: any = await PortofolioModel.findByPk(id);
        if (!data) {
            throw new NotFoundException(`Portofolio dengan ID ${id} tidak ditemukan`);
        }

        await this.enrichStudentNames([data]);

        return {
            status: 'success',
            data: this.normalizeRow(data),
        };
    }

    // 5. Edit Portofolio (Hanya Pemilik)
    async update(id: number, payload: UpdatePortfolioDto, actor: PortfolioActor, imagePath?: string) {
        const user = this.requireActor(actor);
        const portfolio = await this.findOwnedPortfolio(id, user.userId);

        const updatedPayload = {
            title: payload.title ?? portfolio.title,
            description: payload.description ?? portfolio.description,
            studentName: payload.studentName ?? portfolio.studentName,
            major: payload.major ?? portfolio.major ?? null,
            category: payload.category ?? portfolio.category ?? null,
            skill: payload.skill ?? portfolio.skill ?? null,
            image: imagePath ?? payload.image ?? portfolio.image ?? null,
        };

        await (portfolio as any).update(updatedPayload);

        return {
            status: 'success',
            message: 'Portofolio berhasil diperbarui',
            data: this.normalizeRow(portfolio),
        };
    }

    // 6. Hapus Portofolio (Hanya Pemilik)
    async delete(id: number, actor: PortfolioActor) {
        const user = this.requireActor(actor);
        const portfolio = await this.findOwnedPortfolio(id, user.userId);

        await (portfolio as any).destroy();

        return {
            status: 'success',
            message: 'Portofolio berhasil dihapus',
        };
    }
}