import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  summary?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  author: Types.ObjectId;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ default: false, index: true })
  published: boolean;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  likeCount: number;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ published: 1, createdAt: -1 });
