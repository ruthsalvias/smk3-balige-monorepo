import { BadRequestException } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const UPLOAD_ROOT = join(process.cwd(), 'uploads');

const DOCUMENT_EXT = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const EXCEL_EXT = ['.xlsx', '.xls', '.csv'];

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function documentUploadOptions(folder: string): MulterOptions {
  const destination = join(UPLOAD_ROOT, folder);

  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        ensureDir(destination);
        cb(null, destination);
      },
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${folder}-${unique}${ext}`);
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!DOCUMENT_EXT.includes(ext)) {
        return cb(new BadRequestException('Format file tidak didukung'), false);
      }
      cb(null, true);
    },
  };
}

export function memoryUploadOptions(): MulterOptions {
  return {
    storage: memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!EXCEL_EXT.includes(ext)) {
        return cb(new BadRequestException('File harus berformat Excel (.xlsx/.xls/.csv)'), false);
      }
      cb(null, true);
    },
  };
}
