import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MitraKerjasamaService } from './mitra-kerjasama.service';
import { CreateMitraKerjasamaDto, UpdateMitraKerjasamaDto } from './mitra-kerjasama.dto';
import { normalizePath } from '../../../../../libs/common/src/utils/toolsUtil';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/mitra-kerjasama',
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `mitra-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml)$/)) {
      return cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
    }
    cb(null, true);
  },
};

@Controller('mitra-kerjasama')
export class MitraKerjasamaController {
  constructor(private readonly service: MitraKerjasamaService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  create(@Body() dto: CreateMitraKerjasamaDto, @UploadedFile() file?: Express.Multer.File) {
    const logoPath = file ? normalizePath(file.path).replace(/^uploads[/\\]/, '') : undefined;
    return this.service.create(dto, logoPath);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMitraKerjasamaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const logoPath = file ? normalizePath(file.path).replace(/^uploads[/\\]/, '') : undefined;
    return this.service.update(id, dto, logoPath);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}