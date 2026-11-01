import { IsArray, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';

export class SosialMediaDto {
  @IsString()
  @MaxLength(50)
  platform: string;

  @IsUrl({ require_protocol: true }, { message: 'URL sosial media harus lengkap (https://...)' })
  url: string;
}

/** form-data mengirim JSON sebagai string, jadi perlu di-parse dulu. */
function bacaArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  if (value.trim() === '') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const parseJsonArray = () => Transform(({ value }) => bacaArray(value));

/**
 * `whitelist: true` pada ValidationPipe membuang semua properti objek biasa
 * yang tidak punya metadata validasi. Karena @Transform menimpa @Type, tiap
 * item harus dijadikan instance SosialMediaDto di sini — tanpa itu
 * sosial_media selalu tersimpan sebagai [{}].
 */
const parseSosialMedia = () =>
  Transform(({ value }) =>
    plainToInstance(
      SosialMediaDto,
      bacaArray(value)
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          platform: String(item.platform ?? '').trim(),
          url: String(item.url ?? '').trim(),
        })),
    ),
  );

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
  @MaxLength(100)
  judul_hero?: string;

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
  @parseSosialMedia()
  @IsArray()
  @ValidateNested({ each: true })
  sosial_media?: SosialMediaDto[];

  @IsOptional()
  @parseJsonArray()
  @IsArray()
  hero_images?: string[];

  @IsOptional()
  @IsString()
  login_bg_url?: string;
}
