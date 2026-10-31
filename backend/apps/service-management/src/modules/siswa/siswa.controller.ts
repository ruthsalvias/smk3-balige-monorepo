import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { existsSync, unlink } from 'fs';
import { basename, join, resolve } from 'path';
import { SiswaService, SiswaFileType } from './siswa.service';
import type { DokumenSiswa } from '../../models/SiswaModel';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { documentUploadOptions, memoryUploadOptions, UPLOAD_ROOT } from '../../common/upload.util';

const FILE_TYPES: SiswaFileType[] = ['rapor', 'skl', 'ijazah'];
const MAKS_FILE = 10;

@Controller('siswa')
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @Post()
  create(@Body() createSiswaDto: CreateSiswaDto) {
    return this.siswaService.create(createSiswaDto);
  }

  @Get()
  findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.siswaService.findAll(Number(limit) || 20, Number(offset) || 0);
  }

  @Get('search')
  search(
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('kelas') kelas?: string,
    @Query('jurusan') jurusan?: string,
    @Query('status') status?: string,
  ) {
    return this.siswaService.search({ q: q || search, kelas, jurusan, status });
  }

  @Get('stats')
  stats() {
    return this.siswaService.stats();
  }

  @Get('export')
  async export(@Query('search') search: string | undefined, @Res() res: Response) {
    const buffer = await this.siswaService.exportToBuffer(search);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="data_siswa.xlsx"');
    res.send(buffer);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', memoryUploadOptions()))
  import(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('File Excel wajib diunggah');
    return this.siswaService.importFromBuffer(file.buffer);
  }

  @Get('saya')
  async saya(@Headers('x-user-id') userId?: string, @Headers('x-user-name') username?: string) {
    const siswa = await this.siswaService.findByPengguna(userId, username);
    return { data: siswa };
  }

  @Get('saya/download/:type')
  async downloadSaya(
    @Param('type') type: string,
    @Res() res: Response,
    @Headers('x-user-id') userId?: string,
    @Headers('x-user-name') username?: string,
  ) {
    const siswa = await this.siswaService.findByPengguna(userId, username);
    return this.kirimFile(siswa.id, type, res);
  }

  @Get('saya/dokumen/:dokumenId')
  async dokumenSaya(
    @Param('dokumenId') dokumenId: string,
    @Query('unduh') unduh: string | undefined,
    @Res() res: Response,
    @Headers('x-user-id') userId?: string,
    @Headers('x-user-name') username?: string,
  ) {
    const siswa = await this.siswaService.findByPengguna(userId, username);
    const dokumen = this.siswaService.cariDokumen(siswa, dokumenId);
    return this.kirimDokumen(dokumen, res, unduh === '1');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siswaService.findOne(id);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSiswaDto: UpdateSiswaDto) {
    return this.siswaService.update(id, updateSiswaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siswaService.remove(id);
  }

  @Post(':id/upload/:type')
  @UseInterceptors(FilesInterceptor('file', MAKS_FILE, documentUploadOptions('siswa')))
  upload(
    @Param('id') id: string,
    @Param('type') type: string,
    @UploadedFiles() files?: Express.Multer.File[],
    @Headers('x-user-name') username?: string,
  ) {
    if (!FILE_TYPES.includes(type as SiswaFileType)) {
      throw new BadRequestException('Tipe file harus rapor, skl, atau ijazah');
    }
    if (!files?.length) throw new BadRequestException('File wajib diunggah');
    return this.siswaService.attachFiles(id, type as SiswaFileType, files, username || '');
  }

  @Get(':id/dokumen')
  async daftarDokumen(@Param('id') id: string) {
    const siswa = await this.siswaService.findOne(id);
    return { data: siswa.dokumen ?? [] };
  }

  @Get(':id/dokumen/:dokumenId')
  async lihatDokumen(
    @Param('id') id: string,
    @Param('dokumenId') dokumenId: string,
    @Query('unduh') unduh: string | undefined,
    @Res() res: Response,
  ) {
    const dokumen = await this.siswaService.getDokumen(id, dokumenId);
    return this.kirimDokumen(dokumen, res, unduh === '1');
  }

  @Delete(':id/dokumen/:dokumenId')
  async hapusDokumen(@Param('id') id: string, @Param('dokumenId') dokumenId: string) {
    const hasil = await this.siswaService.hapusDokumen(id, dokumenId);
    if (!hasil.data.masihDipakai) {
      unlink(this.pathBerkas(hasil.data.dokumen), () => undefined);
    }
    return { message: hasil.message, data: { id: dokumenId } };
  }

  @Get(':id/download/:type')
  async download(@Param('id') id: string, @Param('type') type: string, @Res() res: Response) {
    return this.kirimFile(id, type, res);
  }

  private pathBerkas(dokumen: DokumenSiswa): string {
    const folder = resolve(join(UPLOAD_ROOT, 'siswa'));
    const absolutePath = resolve(join(folder, basename(dokumen.path)));
    if (!absolutePath.startsWith(folder)) {
      throw new BadRequestException('Path file tidak valid');
    }
    return absolutePath;
  }

  private kirimDokumen(dokumen: DokumenSiswa, res: Response, unduh: boolean) {
    const absolutePath = this.pathBerkas(dokumen);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException('File tidak ditemukan di server');
    }

    if (unduh) return res.download(absolutePath, dokumen.nama);

    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(dokumen.nama)}`,
    );
    res.sendFile(absolutePath);
  }

  private async kirimFile(id: string, type: string, res: Response) {
    if (!FILE_TYPES.includes(type as SiswaFileType)) {
      throw new BadRequestException('Tipe file harus rapor, skl, atau ijazah');
    }

    const relativePath = await this.siswaService.getFilePath(id, type as SiswaFileType);
    const fileName = relativePath.split('/').pop() as string;
    const absolutePath = resolve(join(UPLOAD_ROOT, 'siswa', fileName));

    if (!absolutePath.startsWith(resolve(join(UPLOAD_ROOT, 'siswa')))) {
      throw new BadRequestException('Path file tidak valid');
    }
    if (!existsSync(absolutePath)) {
      throw new NotFoundException('File tidak ditemukan di server');
    }

    res.download(absolutePath, fileName);
  }
}
