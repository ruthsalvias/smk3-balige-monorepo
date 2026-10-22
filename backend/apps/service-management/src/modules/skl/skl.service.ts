import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, IsNull } from 'typeorm';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { SklFolder } from '../../models/SklFolderModel';
import { SklFile } from '../../models/SklFileModel';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UPLOAD_ROOT } from '../../common/upload.util';

@Injectable()
export class SklService {
  constructor(
    @InjectRepository(SklFolder)
    private readonly folderRepo: Repository<SklFolder>,
    @InjectRepository(SklFile)
    private readonly fileRepo: Repository<SklFile>,
  ) {}

  /**
   * Menjelajah isi folder (Google Drive explorer view).
   * Jika folderId null / undefined / 'root' -> jelajah root.
   */
  async getExplorer(folderId?: string | null) {
    const isRoot = !folderId || folderId === 'root' || folderId === 'null';
    const targetFolderId = isRoot ? null : folderId;

    let currentFolder: SklFolder | null = null;
    const breadcrumbs: Array<{ id: string | null; nama: string }> = [
      { id: null, nama: 'Drive SKL' },
    ];

    if (targetFolderId) {
      currentFolder = await this.folderRepo.findOne({ where: { id: targetFolderId } });
      if (!currentFolder) {
        throw new NotFoundException('Folder tidak ditemukan');
      }

      // Bangun breadcrumb mundur sampai root
      const ancestors: Array<{ id: string; nama: string }> = [];
      let parentPtr = currentFolder.parentId;

      while (parentPtr) {
        const parent = await this.folderRepo.findOne({ where: { id: parentPtr } });
        if (!parent) break;
        ancestors.unshift({ id: parent.id, nama: parent.nama });
        parentPtr = parent.parentId;
      }

      breadcrumbs.push(...ancestors);
      breadcrumbs.push({ id: currentFolder.id, nama: currentFolder.nama });
    }

    // Ambil direct subfolder
    const rawFolders = await this.folderRepo.find({
      where: { parentId: targetFolderId === null ? IsNull() : targetFolderId },
      order: { nama: 'ASC' },
    });

    // Ambil direct files
    const files = await this.fileRepo.find({
      where: { folderId: targetFolderId === null ? IsNull() : targetFolderId },
      order: { createdAt: 'DESC' },
    });

    // Hitung jumlah file dan subfolder untuk masing-masing folder
    const foldersWithCounts = await Promise.all(
      rawFolders.map(async (folder) => {
        const fileCount = await this.fileRepo.count({ where: { folderId: folder.id } });
        const subfolderCount = await this.folderRepo.count({ where: { parentId: folder.id } });
        return {
          ...folder,
          fileCount,
          subfolderCount,
        };
      }),
    );

    return {
      currentFolder,
      breadcrumbs,
      folders: foldersWithCounts,
      files,
      stats: {
        folderCount: foldersWithCounts.length,
        fileCount: files.length,
        totalBytes: files.reduce((acc, f) => acc + Number(f.ukuran || 0), 0),
      },
    };
  }

  /**
   * Buat folder baru
   */
  async createFolder(dto: CreateFolderDto, username?: string) {
    if (dto.parentId && dto.parentId !== 'root') {
      const parent = await this.folderRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent folder tidak ditemukan');
    }

    const folder = this.folderRepo.create({
      nama: dto.nama.trim(),
      parentId: dto.parentId && dto.parentId !== 'root' ? dto.parentId : null,
      warna: dto.warna || 'blue',
      dibuatOleh: username || 'admin',
    });

    return this.folderRepo.save(folder);
  }

  /**
   * Update folder (rename / ubah warna / pindah parent)
   */
  async updateFolder(id: string, dto: UpdateFolderDto) {
    const folder = await this.folderRepo.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('Folder tidak ditemukan');

    if (dto.nama !== undefined) folder.nama = dto.nama.trim();
    if (dto.warna !== undefined) folder.warna = dto.warna;
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Folder tidak bisa menjadi parent dari dirinya sendiri');
      }
      folder.parentId = dto.parentId && dto.parentId !== 'root' ? dto.parentId : null;
    }

    return this.folderRepo.save(folder);
  }

  /**
   * Hapus folder dan seluruh isinya secara rekursif
   */
  async deleteFolder(id: string) {
    const folder = await this.folderRepo.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('Folder tidak ditemukan');

    // Kumpulkan semua descendant folder ID secara rekursif
    const allFolderIds: string[] = [id];
    const queue: string[] = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await this.folderRepo.find({ where: { parentId: currentId } });
      for (const child of children) {
        allFolderIds.push(child.id);
        queue.push(child.id);
      }
    }

    // Ambil seluruh file dalam folder-folder ini
    const allFiles = await this.fileRepo.find({
      where: { folderId: In(allFolderIds) },
    });

    // Hapus file fisik di disk
    for (const file of allFiles) {
      try {
        const fullPath = join(UPLOAD_ROOT, file.path);
        if (existsSync(fullPath)) unlinkSync(fullPath);
      } catch (err) {
        console.warn(`Gagal menghapus file fisik ${file.path}:`, err);
      }
    }

    // Hapus records dari database
    if (allFiles.length > 0) {
      await this.fileRepo.delete({ id: In(allFiles.map((f) => f.id)) });
    }

    await this.folderRepo.delete({ id: In(allFolderIds) });

    return {
      success: true,
      message: `Folder '${folder.nama}' beserta isinya (${allFiles.length} file) berhasil dihapus`,
    };
  }

  /**
   * Simpan file hasil upload
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folderId?: string | null,
    tahunLulus?: string,
    keterangan?: string,
    username?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Tidak ada file yang diunggah');
    }

    const targetFolderId =
      folderId && folderId !== 'root' && folderId !== 'null' ? folderId : null;

    if (targetFolderId) {
      const folder = await this.folderRepo.findOne({ where: { id: targetFolderId } });
      if (!folder) throw new NotFoundException('Folder target tidak ditemukan');
    }

    const savedFiles: SklFile[] = [];

    for (const file of files) {
      const storedFileName = file.filename;
      const relativePath = `skl/${storedFileName}`;

      const newFile = this.fileRepo.create({
        folderId: targetFolderId,
        namaFile: file.originalname,
        storedFileName,
        path: relativePath,
        ukuran: file.size,
        mimeType: file.mimetype || 'application/pdf',
        tahunLulus: tahunLulus ? tahunLulus.trim() : null,
        keterangan: keterangan ? keterangan.trim() : null,
        diunggahOleh: username || 'admin',
      });

      const saved = await this.fileRepo.save(newFile);
      savedFiles.push(saved);
    }

    return {
      success: true,
      count: savedFiles.length,
      files: savedFiles,
    };
  }

  /**
   * Update file (rename / ubah tahun / ubah keterangan / pindah folder)
   */
  async updateFile(id: string, dto: UpdateFileDto) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File tidak ditemukan');

    if (dto.namaFile !== undefined) file.namaFile = dto.namaFile.trim();
    if (dto.tahunLulus !== undefined) file.tahunLulus = dto.tahunLulus ? dto.tahunLulus.trim() : null;
    if (dto.keterangan !== undefined) file.keterangan = dto.keterangan ? dto.keterangan.trim() : null;
    if (dto.folderId !== undefined) {
      file.folderId = dto.folderId && dto.folderId !== 'root' ? dto.folderId : null;
    }

    return this.fileRepo.save(file);
  }

  /**
   * Hapus single file
   */
  async deleteFile(id: string) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File tidak ditemukan');

    try {
      const fullPath = join(UPLOAD_ROOT, file.path);
      if (existsSync(fullPath)) unlinkSync(fullPath);
    } catch (err) {
      console.warn(`Gagal menghapus file fisik ${file.path}:`, err);
    }

    await this.fileRepo.delete({ id: file.id });

    return {
      success: true,
      message: `File '${file.namaFile}' berhasil dihapus`,
    };
  }

  /**
   * Ambil info file untuk didownload atau dipreview
   */
  async getFile(id: string) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File tidak ditemukan');

    const fullPath = join(UPLOAD_ROOT, file.path);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('File fisik tidak ditemukan pada server');
    }

    return {
      file,
      fullPath,
    };
  }

  /**
   * Cari file atau folder di seluruh drive
   */
  async search(q: string, tahunLulus?: string) {
    const queryStr = q ? q.trim() : '';

    const folderConditions: any[] = [];
    if (queryStr) {
      folderConditions.push({ nama: Like(`%${queryStr}%`) });
    }

    const folders =
      folderConditions.length > 0
        ? await this.folderRepo.find({ where: folderConditions, take: 50 })
        : [];

    const fileWhere: any = {};
    if (queryStr) {
      fileWhere.namaFile = Like(`%${queryStr}%`);
    }
    if (tahunLulus) {
      fileWhere.tahunLulus = tahunLulus;
    }

    const files = await this.fileRepo.find({
      where: fileWhere,
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return {
      folders,
      files,
    };
  }

  /**
   * Statistik ringkasan drive SKL
   */
  async getStats() {
    const totalFolders = await this.folderRepo.count();
    const totalFiles = await this.fileRepo.count();

    const sumResult = await this.fileRepo
      .createQueryBuilder('f')
      .select('SUM(f.ukuran)', 'totalSize')
      .getRawOne();

    const totalBytes = Number(sumResult?.totalSize || 0);

    const recentFiles = await this.fileRepo.find({
      order: { createdAt: 'DESC' },
      take: 6,
    });

    return {
      totalFolders,
      totalFiles,
      totalBytes,
      recentFiles,
    };
  }
}
