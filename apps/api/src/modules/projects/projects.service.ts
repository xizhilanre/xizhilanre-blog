import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Project, ProjectDocument } from './projects.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async findAll(tech?: string) {
    const filter: FilterQuery<ProjectDocument> = {};
    if (tech) {
      filter.techStack = tech;
    }
    const items = await this.projectModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return items;
  }

  async findById(id: string) {
    const project = await this.projectModel.findById(id).lean();
    if (!project) {
      throw new NotFoundException('作品不存在');
    }
    return project;
  }

  async create(data: Record<string, unknown>) {
    return this.projectModel.create(data);
  }

  async update(id: string, data: Record<string, unknown>) {
    const project = await this.projectModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!project) {
      throw new NotFoundException('作品不存在');
    }
    return project;
  }

  async delete(id: string) {
    const project = await this.projectModel.findByIdAndDelete(id);
    if (!project) {
      throw new NotFoundException('作品不存在');
    }
    return null;
  }
}
