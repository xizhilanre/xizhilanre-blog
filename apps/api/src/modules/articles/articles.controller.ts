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
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(
    @Query('tag') tag?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.articlesService.findAll({ tag, page, limit, search }).then((data) => ({
      success: true,
      data,
    }));
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.articlesService.findById(id).then((data) => ({
      success: true,
      data,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.articlesService
      .create({ ...body, author: req.user.id })
      .then((data) => ({
        success: true,
        data,
        message: '文章创建成功',
      }));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.articlesService
      .update(id, req.user.id, body)
      .then((data) => ({
        success: true,
        data,
        message: '文章更新成功',
      }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.articlesService.delete(id, req.user.id).then(() => ({
      success: true,
      message: '文章已删除',
    }));
  }

  @Post(':id/like')
  like(@Param('id') id: string) {
    return this.articlesService.like(id).then((data) => ({
      success: true,
      data,
      message: '点赞成功',
    }));
  }
}
