import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FasilitasService } from './fasilitas.service';
import { CreateFasilitasDto, UpdateFasilitasDto } from './fasilitas.dto';
import { normalizePath } from '../../../../../libs/common/src/utils/toolsUtil';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/fasilitas',
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `fasilitas-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
    }
    cb(null, true);
  },
};

@Controller('fasilitas')
export class FasilitasController {
  constructor(private readonly service: FasilitasService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('foto', multerOptions))
  create(@Body() dto: CreateFasilitasDto, @UploadedFile() file?: Express.Multer.File) {
    const fotoPath = file ? normalizePath(file.path).replace(/^uploads[/\\]/, '') : undefined;
    return this.service.create(dto, fotoPath);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('foto', multerOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFasilitasDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fotoPath = file ? normalizePath(file.path).replace(/^uploads[/\\]/, '') : undefined;
    return this.service.update(id, dto, fotoPath);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}