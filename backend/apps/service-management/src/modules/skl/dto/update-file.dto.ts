import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  namaFile?: string;

  @IsOptional()
  @IsString()
  folderId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tahunLulus?: string;

  @IsOptional()
  @IsString()
  keterangan?: string;
}
