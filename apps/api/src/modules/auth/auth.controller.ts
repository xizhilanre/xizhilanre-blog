import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto).then((data) => ({
      success: true,
      data,
      message: '注册成功',
    }));
  }

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
  profile(@Request() req: any) {
    return this.authService.profile(req.user.id).then((data) => ({
      success: true,
      data,
    }));
  }
}
