import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { GuruService } from './guru.service';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { memoryUploadOptions } from '../../common/upload.util';

@Controller('guru')
export class GuruController {
  constructor(private readonly guruService: GuruService) {}

  @Post()
  create(@Body() createGuruDto: CreateGuruDto) {
    return this.guruService.create(createGuruDto);
  }

  @Get()
  findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.guruService.findAll(Number(limit) || 20, Number(offset) || 0);
  }

  @Get('search')
  search(
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('mataPelajaran') mataPelajaran?: string,
    @Query('jabatan') jabatan?: string,
  ) {
    return this.guruService.search({ q: q || search, mataPelajaran, jabatan });
  }

  @Get('total')
  total() {
    return this.guruService.total();
  }

  @Get('export')
  async export(@Res() res: Response) {
    const buffer = await this.guruService.exportToBuffer();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="data_guru.xlsx"');
    res.send(buffer);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', memoryUploadOptions()))
  import(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('File Excel wajib diunggah');
    return this.guruService.importFromBuffer(file.buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guruService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGuruDto: UpdateGuruDto) {
    return this.guruService.update(id, updateGuruDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guruService.remove(id);
  }
}
