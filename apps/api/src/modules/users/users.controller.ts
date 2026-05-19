import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id).then((data) => ({
      success: true,
      data,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Body() body: any, @Request() req: any) {
    return this.usersService
      .updateProfile(req.user.id, body)
      .then((data) => ({
        success: true,
        data,
        message: '个人信息已更新',
      }));
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/:articleId')
  addFavorite(
    @Param('articleId') articleId: string,
    @Request() req: any,
  ) {
    return this.usersService
      .addFavorite(req.user.id, articleId)
      .then((data) => ({
        success: true,
        data,
        message: '收藏成功',
      }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:articleId')
  removeFavorite(
    @Param('articleId') articleId: string,
    @Request() req: any,
  ) {
    return this.usersService
      .removeFavorite(req.user.id, articleId)
      .then((data) => ({
        success: true,
        data,
        message: '已取消收藏',
      }));
  }
}
