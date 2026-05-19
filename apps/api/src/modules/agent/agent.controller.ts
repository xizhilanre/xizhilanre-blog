import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { IsString, IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { AgentService } from './agent.service';

class SummarizeDto {
  @IsString()
  @MinLength(10)
  content: string;
}

class RecommendDto {
  @IsString()
  articleId: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

class WriteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  style?: string;
}

@Controller('agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('summarize')
  @HttpCode(200)
  async summarize(@Body() dto: SummarizeDto, @Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    if (!this.agentService.checkRateLimit(userId)) {
      throw new HttpException(
        { success: false, message: '请求过于频繁，每分钟最多 5 次' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const result = await this.agentService.summarize(dto.content);
    return { success: true, data: result };
  }

  @Post('recommend')
  @HttpCode(200)
  async recommend(@Body() dto: RecommendDto, @Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    if (!this.agentService.checkRateLimit(userId)) {
      throw new HttpException(
        { success: false, message: '请求过于频繁，每分钟最多 5 次' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const result = await this.agentService.recommend(dto.articleId, dto.tags);
    return { success: true, data: result };
  }

  @Post('write')
  @HttpCode(200)
  async write(@Body() dto: WriteDto, @Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    if (!this.agentService.checkRateLimit(userId)) {
      throw new HttpException(
        { success: false, message: '请求过于频繁，每分钟最多 5 次' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const result = await this.agentService.write(dto.title, dto.keywords, dto.style);
    return { success: true, data: result };
  }
}
