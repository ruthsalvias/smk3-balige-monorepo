import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { News } from '../entities/news.entity';
import { Announcement } from '../entities/announcement.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(News)
    private newsRepo: Repository<News>,
    @InjectRepository(Announcement)
    private annRepo: Repository<Announcement>,
  ) {}

  async searchAll(keyword: string, limit = 20) {
    const normalizedKeyword = this.normalizeKeyword(keyword);
    const [news, announcements] = await Promise.all([
      this.searchNews(normalizedKeyword, limit),
      this.searchAnnouncements(normalizedKeyword, limit),
    ]);

    return { news, announcements };
  }

  async searchNews(keyword: string, limit = 20) {
    const normalizedKeyword = this.normalizeKeyword(keyword);
    return this.newsRepo.find({
      where: [
        { title: Like(`%${normalizedKeyword}%`), isActive: true },
        { content: Like(`%${normalizedKeyword}%`), isActive: true },
      ],
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 50),
    });
  }

  async searchAnnouncements(keyword: string, limit = 20) {
    const normalizedKeyword = this.normalizeKeyword(keyword);
    return this.annRepo.find({
      where: [
        { title: Like(`%${normalizedKeyword}%`), isActive: true },
        { content: Like(`%${normalizedKeyword}%`), isActive: true },
      ],
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 50),
    });
  }

  private normalizeKeyword(keyword: string): string {
    const normalized = (keyword ?? '').trim();
    if (normalized.length < 2) {
      throw new BadRequestException('Kata kunci minimal 2 karakter');
    }
    return normalized;
  }
}
