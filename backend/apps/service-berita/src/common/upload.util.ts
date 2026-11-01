import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

const ALLOWED_MIME = /^image\/(jpg|jpeg|png|webp|gif)$/;

/** Multer config untuk upload gambar ke folder `uploads/<folder>`. */
export function imageUploadOptions(folder: string) {
  const destination = join(process.cwd(), 'uploads', folder);

  return {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: any) => {
        if (!existsSync(destination)) {
          mkdirSync(destination, { recursive: true });
        }
        cb(null, destination);
      },
      filename: (_req: any, file: any, cb: any) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${folder}-${unique}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
      if (!ALLOWED_MIME.test(file.mimetype)) {
        return cb(
          new BadRequestException('Hanya file gambar (jpg, png, webp, gif) yang diperbolehkan'),
          false,
        );
      }
      cb(null, true);
    },
  };
}

export function publicImageUrl(
  folder: string,
  file?: Express.Multer.File,
): string | undefined {
  return file ? `/uploads/${folder}/${file.filename}` : undefined;
}
