import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SklService } from './skl.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { documentUploadOptions } from '../../common/upload.util';

@Controller('skl')
export class SklController {
  constructor(private readonly sklService: SklService) {}

  /**
   * Menjelajahi folder dan file dalam suatu direktori (Drive view)
   */
  @Get('explorer')
  getExplorer(@Query('folderId') folderId?: string) {
    return this.sklService.getExplorer(folderId);
  }

  /**
   * Cari folder atau file berdasarkan nama atau tahun lulus
   */
  @Get('search')
  search(@Query('q') q: string, @Query('tahunLulus') tahunLulus?: string) {
    return this.sklService.search(q, tahunLulus);
  }

  /**
   * Statistik penyimpanan SKL
   */
  @Get('stats')
  getStats() {
    return this.sklService.getStats();
  }

  /**
   * Buat folder baru
   */
  @Post('folders')
  createFolder(
    @Body() dto: CreateFolderDto,
    @Headers('x-user-name') username?: string,
  ) {
    return this.sklService.createFolder(dto, username);
  }

  /**
   * Edit / Rename folder
   */
  @Put('folders/:id')
  updateFolder(@Param('id') id: string, @Body() dto: UpdateFolderDto) {
    return this.sklService.updateFolder(id, dto);
  }

  /**
   * Hapus folder beserta seluruh isinya
   */
  @Delete('folders/:id')
  deleteFolder(@Param('id') id: string) {
    return this.sklService.deleteFolder(id);
  }

  /**
   * Upload multiple file SKL sekaligus ke dalam folder tertentu
   */
  @Post('files/upload')
  @UseInterceptors(FilesInterceptor('files', 50, documentUploadOptions('skl')))
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folderId') folderId?: string,
    @Body('tahunLulus') tahunLulus?: string,
    @Body('keterangan') keterangan?: string,
    @Headers('x-user-name') username?: string,
  ) {
    return this.sklService.uploadFiles(files, folderId, tahunLulus, keterangan, username);
  }

  /**
   * Edit / Rename file
   */
  @Put('files/:id')
  updateFile(@Param('id') id: string, @Body() dto: UpdateFileDto) {
    return this.sklService.updateFile(id, dto);
  }

  /**
   * Hapus file
   */
  @Delete('files/:id')
  deleteFile(@Param('id') id: string) {
    return this.sklService.deleteFile(id);
  }

  /**
   * Download file dengan nama aslinya
   */
  @Get('files/:id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { file, fullPath } = await this.sklService.getFile(id);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.download(fullPath, file.namaFile);
  }

  /**
   * Preview file inline di browser (untuk PDF atau Gambar)
   */
  @Get('files/:id/preview')
  async previewFile(@Param('id') id: string, @Res() res: Response) {
    const { file, fullPath } = await this.sklService.getFile(id);
    res.setHeader('Content-Type', file.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.namaFile)}"`);
    res.sendFile(fullPath);
  }
}
