import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query('tech') tech?: string) {
    return this.projectsService.findAll(tech).then((data) => ({
      success: true,
      data,
    }));
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.projectsService.findById(id).then((data) => ({
      success: true,
      data,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.projectsService.create(body).then((data) => ({
      success: true,
      data,
      message: '作品创建成功',
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(id, body).then((data) => ({
      success: true,
      data,
      message: '作品更新成功',
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id).then(() => ({
      success: true,
      message: '作品已删除',
    }));
  }
}
