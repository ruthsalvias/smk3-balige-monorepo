import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, Req, ParseIntPipe,
    UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PortofolioService } from './portofolio.service';
import { CreatePortfolioDto } from './dto/create-portofolio.dto';
import { UpdatePortfolioDto } from './dto/update-portofolio.dto';
import { QueryPortfolioDto } from './dto/query-portofolio.dto';
import { normalizePath } from '@app/common';

const multerOptions = {
    storage: diskStorage({
        destination: './uploads/portofolio',
        filename: (req: any, file: any, cb: any) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `portofolio-${uniqueSuffix}${extname(file.originalname)}`);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req: any, file: any, cb: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
        }
        cb(null, true);
    },
};

@Controller('portofolio')
export class PortofolioController {
    constructor(private readonly portfolioService: PortofolioService) { }

    private getActor(req: Request) {
        return {
            userId: req.header('X-User-Id') ?? '',
            username: req.header('X-User-Name') ?? '',
            roles: (req.header('X-User-Roles') ?? '')
                .split(',')
                .map((role) => role.trim())
                .filter(Boolean),
        };
    }

    // 1. Tambah Portofolio (Siswa Login)
    @Post()
    @UseInterceptors(FileInterceptor('image', multerOptions))
    async create(
        @Body() dto: CreatePortfolioDto,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const imagePath = file ? normalizePath(file.path).replace(/^uploads[/\\]/, '') : undefined;
        return await this.portfolioService.create(dto, this.getActor(req), imagePath);
    }

    // 2. Public: Lihat Semua Portofolio (Siswa / Pengunjung)
    @Get()
    async getAll(@Query() query: QueryPortfolioDto) {
        return await this.portfolioService.findAll(query);
    }

    // 3. Khusus Siswa: Lihat Portofolio Milik Sendiri
    // Catatan: Wajib ditaruh SEBELUM route ':id' agar 'me' tidak dianggap sebagai ID
    @Get('me')
    async getMine(@Query() query: QueryPortfolioDto, @Req() req: Request) {
        return await this.portfolioService.findMine(query, this.getActor(req));
    }

    // 4. Public: Lihat Detail Portofolio
    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.portfolioService.findOne(id);
    }

    // 5. Edit Portofolio (Hanya Pemilik)
    @Put(':id')
    @UseInterceptors(FileInterceptor('image', multerOptions))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePortfolioDto,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const imagePath = file ? normalizePath(file.path).replace(/^uploads[/\\]/, '') : undefined;
        return await this.portfolioService.update(id, dto, this.getActor(req), imagePath);
    }

    // 6. Hapus Portofolio (Hanya Pemilik)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        return await this.portfolioService.delete(id, this.getActor(req));
    }
}