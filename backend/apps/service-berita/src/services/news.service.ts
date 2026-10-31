import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DeepPartial } from 'typeorm';
import { News } from '../entities/news.entity';
import { CreateNewsDto, UpdateNewsDto } from '../dtos';
import { CategoryService } from './category.service';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private repo: Repository<News>,
    private categoryService: CategoryService,
  ) {}

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  private async makeUniqueSlug(title: string, currentId?: number): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.repo.findOne({ where: { slug } });
      if (!existing || existing.id === currentId) {
        return slug;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  private async makeUniqueSlugWithRetry(title: string, currentId?: number, maxRetries: number = 5): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.makeUniqueSlug(title, currentId);
      } catch (error: any) {
        // Unique constraint violation - retry with suffix
        if ((error.code === 'ER_DUP_ENTRY' || error.code === '23505') && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
    throw new Error(`Failed to generate unique slug after ${maxRetries} retries`);
  }

  async create(dto: CreateNewsDto): Promise<News> {
    // Generate unique slug with retry logic for TOCTOU race conditions
    let slug: string;
    try {
      slug = await this.makeUniqueSlugWithRetry(dto.title);
    } catch (error) {
      throw new Error(`Failed to generate unique slug: ${error}`);
    }

    const entity = this.repo.create({
      title: dto.title.trim(),
      content: dto.content,
      description: dto.description ?? null,
      excerpt: dto.excerpt ?? (dto.content.substring(0, 150) + '...'),
      slug,
      imageUrl: dto.imageUrl ?? '',
      author: dto.author ?? 'Admin',
      createdBy: dto.author ?? null,
      isFeatured: dto.isFeatured ?? false,
      isActive: true,
    } as DeepPartial<News>);

    if (dto.categoryId) {
      entity.category = await this.categoryService.findById(dto.categoryId);
    }

    return this.repo.save(entity);
  }

  async findAll(page = 1, limit = 10, categoryId?: number) {
    limit = Math.min(limit, 50);

    const qb = this.repo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.category', 'c')
      .where('n.isActive = true');

    if (categoryId) {
      qb.andWhere('c.id = :categoryId', { categoryId });
    }

    qb.orderBy('n.isPinned', 'DESC').addOrderBy('n.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(id: number): Promise<News> {
    const data = await this.repo.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    });

    if (!data) throw new NotFoundException(`News ${id} tidak ditemukan`);

    return data;
  }

  async search(keyword: string, limit = 20): Promise<News[]> {
    return this.repo.find({
      where: [
        { title: Like(`%${keyword}%`), isActive: true },
        { content: Like(`%${keyword}%`), isActive: true },
      ],
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 50),
    });
  }

  async update(id: number, dto: UpdateNewsDto): Promise<News> {
    const entity = await this.findById(id);

    if (dto.title) {
      entity.title = dto.title.trim();
      entity.slug = await this.makeUniqueSlug(dto.title, id);
    }

    if (dto.content) entity.content = dto.content;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.excerpt) entity.excerpt = dto.excerpt;
    if (dto.imageUrl) entity.imageUrl = dto.imageUrl;
    if (dto.author) entity.author = dto.author;
    if (dto.author) entity.updatedBy = dto.author;
    if (dto.isFeatured !== undefined) entity.isFeatured = dto.isFeatured;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;

    if (dto.categoryId) {
      entity.category = await this.categoryService.findById(dto.categoryId);
    }

    return this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.findById(id);
    entity.isActive = false;
    await this.repo.save(entity);
  }

  async incrementViews(id: number): Promise<News> {
    // Use atomic increment to prevent race conditions
    // This ensures views are incremented safely even with concurrent requests
    await this.repo.increment({ id }, 'views', 1);
    return this.findById(id);
  }

  async toggleFeatured(id: number): Promise<News> {
    const entity = await this.findById(id);
    entity.isFeatured = !entity.isFeatured;
    return this.repo.save(entity);
  }

  async togglePin(id: number): Promise<News> {
    const entity = await this.findById(id);
    entity.isPinned = !entity.isPinned;
    return this.repo.save(entity);
  }

  async toggleActive(id: number): Promise<News> {
    const entity = await this.findById(id);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }
}
