import { Injectable } from '@nestjs/common';
import PengaturanSekolahModel from '../../models/PengaturanSekolahModel';
import { UpdatePengaturanSekolahDto } from './pengaturan-sekolah.dto';

/** Pengaturan sekolah bersifat singleton: selalu tepat satu baris. */
@Injectable()
export class PengaturanSekolahService {
  async find() {
    const existing = await PengaturanSekolahModel.findOne({
      order: [['created_at', 'ASC']],
    });
    if (existing) return existing;

    return await PengaturanSekolahModel.create({} as any);
  }

  async update(
    dto: UpdatePengaturanSekolahDto,
    logoUrl?: string,
    heroImagePaths?: string[],
    loginBgUrl?: string,
  ) {
    const data = await this.find();
    const payload: Record<string, unknown> = { ...dto };
    if (logoUrl) payload.logo_url = logoUrl;
    if (loginBgUrl) {
      payload.login_bg_url = loginBgUrl;
    } else if (dto.login_bg_url === "" || dto.login_bg_url === "null") {
      payload.login_bg_url = null;
    }

    // Untuk hero_images: gabungkan path baru dengan yang sudah ada (dari dto.hero_images)
    // dto.hero_images berisi path lama yang masih dipertahankan
    // heroImagePaths berisi path file baru yang baru di-upload
    if (heroImagePaths && heroImagePaths.length > 0) {
      const existing = Array.isArray(dto.hero_images) ? dto.hero_images : [];
      payload.hero_images = [...existing, ...heroImagePaths];
    }

    return await data.update(payload);
  }
}
