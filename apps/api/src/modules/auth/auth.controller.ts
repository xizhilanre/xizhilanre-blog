import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

interface JwtRequest {
  user: { id: string; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto).then((data) => ({
      success: true,
      data,
      message: '登录成功',
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: JwtRequest) {
    return this.authService.profile(req.user.id).then((data) => ({
      success: true,
      data,
    }));
  }
}
