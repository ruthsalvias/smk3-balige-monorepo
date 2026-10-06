import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nama?: string;

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  warna?: string;
}
