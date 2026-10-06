import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty({ message: 'Nama folder wajib diisi' })
  @IsString()
  @MaxLength(255)
  nama!: string;

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  warna?: string;
}
