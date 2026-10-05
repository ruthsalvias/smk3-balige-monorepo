import { IsArray, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SosialMediaDto {
  @IsString()
  @MaxLength(50)
  platform: string;

  @IsUrl({ require_protocol: true }, { message: 'URL sosial media harus lengkap (https://...)' })
  url: string;
}

/** form-data mengirim JSON sebagai string, jadi perlu di-parse dulu. */
const parseJsonArray = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    if (value.trim() === '') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

export class UpdatePengaturanSekolahDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nama_sekolah?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_singkat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tagline?: string;

  @IsOptional()
  @IsString()
  deskripsi_singkat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tahun_ajaran?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  telepon?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  jam_operasional?: string;

  @IsOptional()
  @parseJsonArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SosialMediaDto)
  sosial_media?: SosialMediaDto[];

  @IsOptional()
  @parseJsonArray()
  @IsArray()
  hero_images?: string[];

  @IsOptional()
  @IsString()
  login_bg_url?: string;
}
