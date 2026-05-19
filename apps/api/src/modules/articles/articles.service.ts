import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Article, ArticleDocument } from './articles.schema';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async findAll(query: {
    tag?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { tag, search } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: FilterQuery<ArticleDocument> = { published: true };

    if (tag) {
      filter.tags = tag;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const article = await this.articleModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .populate('author', 'username avatar')
      .lean();

    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article;
  }

  async create(data: {
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    published?: boolean;
    author: string;
  }) {
    const article = await this.articleModel.create(data);
    return article.populate('author', 'username avatar');
  }

  async update(id: string, userId: string, data: Record<string, unknown>) {
    const article = await this.articleModel.findById(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    if (article.author.toString() !== userId) {
      throw new ForbiddenException('只能修改自己的文章');
    }

    Object.assign(article, data);
    await article.save();
    return article.populate('author', 'username avatar');
  }

  async delete(id: string, userId: string) {
    const article = await this.articleModel.findById(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    if (article.author.toString() !== userId) {
      throw new ForbiddenException('只能删除自己的文章');
    }
    await this.articleModel.findByIdAndDelete(id);
    return null;
  }

  async like(id: string) {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true },
    );
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return { likeCount: article.likeCount };
  }
}
