import {
  Controller, Get, Put, Post,
  Body, UploadedFiles, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PengaturanSekolahService } from './pengaturan-sekolah.service';
import { UpdatePengaturanSekolahDto } from './pengaturan-sekolah.dto';
import { normalizePath } from '../../../../../libs/common/src/utils/toolsUtil';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/pengaturan',
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const prefix = file.fieldname === 'hero_images' ? 'hero' : file.fieldname === 'login_bg' ? 'loginbg' : 'logo';
      cb(null, `${prefix}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml)$/)) {
      return cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
    }
    cb(null, true);
  },
};

@Controller('pengaturan-sekolah')
export class PengaturanSekolahController {
  constructor(private readonly service: PengaturanSekolahService) {}

  @Get()
  find() {
    return this.service.find();
  }

  @Put()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'hero_images', maxCount: 10 },
    { name: 'login_bg', maxCount: 1 },
  ], multerOptions))
  update(
    @Body() dto: UpdatePengaturanSekolahDto,
    @UploadedFiles() files?: {
      logo?: Express.Multer.File[];
      hero_images?: Express.Multer.File[];
      login_bg?: Express.Multer.File[];
    },
  ) {
    const logoUrl = files?.logo?.[0]
      ? normalizePath(files.logo[0].path).replace(/^uploads[/\\]/, '')
      : undefined;

    const heroImagePaths = files?.hero_images?.map(f =>
      normalizePath(f.path).replace(/^uploads[/\\]/, ''),
    );

    const loginBgUrl = files?.login_bg?.[0]
      ? normalizePath(files.login_bg[0].path).replace(/^uploads[/\\]/, '')
      : undefined;

    return this.service.update(dto, logoUrl, heroImagePaths, loginBgUrl);
  }

  // alias agar klien yang hanya bisa POST tetap dapat menyimpan
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'hero_images', maxCount: 10 },
    { name: 'login_bg', maxCount: 1 },
  ], multerOptions))
  save(
    @Body() dto: UpdatePengaturanSekolahDto,
    @UploadedFiles() files?: {
      logo?: Express.Multer.File[];
      hero_images?: Express.Multer.File[];
      login_bg?: Express.Multer.File[];
    },
  ) {
    return this.update(dto, files);
  }
}
