import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  techStack: string[];

  @Prop({ type: [String], default: [] })
  media: string[];

  @Prop()
  projectLink?: string;

  @Prop()
  demoLink?: string;

  @Prop({ default: false })
  featured: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
