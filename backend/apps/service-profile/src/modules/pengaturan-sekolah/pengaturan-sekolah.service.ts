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
    const payload: Record<string, any> = {};

    // Update logo URL if provided
    if (logoUrl) {
      payload.logo_url = logoUrl;
    }

    // Handle login background URL
    if (loginBgUrl) {
      payload.login_bg_url = loginBgUrl;
    } else if (dto.login_bg_url === "" || dto.login_bg_url === "null" || dto.login_bg_url === null) {
      // If explicitly cleared from the frontend
      payload.login_bg_url = null;
    }

    // Handle hero images:
    // If DTO explicitly sends hero_images (as an array of kept images, even if empty or subset),
    // use that list and append any newly uploaded hero images.
    if (dto.hero_images !== undefined) {
      const keptHeroImages = Array.isArray(dto.hero_images) ? dto.hero_images : [];
      const newHeroImages = heroImagePaths && heroImagePaths.length > 0 ? heroImagePaths : [];
      payload.hero_images = [...keptHeroImages, ...newHeroImages];
    } else if (heroImagePaths && heroImagePaths.length > 0) {
      const currentHero = (data as any).hero_images;
      const existingHeroImages = Array.isArray(currentHero) ? currentHero : [];
      payload.hero_images = [...existingHeroImages, ...heroImagePaths];
    }

    // Update other fields from DTO
    Object.keys(dto).forEach((key) => {
      // Avoid overwriting fields that are handled above, and only update if value is present
      if (key !== 'hero_images' && key !== 'login_bg_url' && key !== 'logo_url' && dto[key] !== undefined) {
        payload[key] = dto[key];
      }
    });

    return await data.update(payload);
  }
}
