import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      success: true,
      data: { name: 'xizhilanre-blog API', version: '0.0.1' },
      message: 'API 服务运行中',
    };
  }

  @Get('health')
  health() {
    return { success: true, message: 'OK' };
  }
}
