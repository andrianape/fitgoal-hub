import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      application: 'FitGoal Hub API',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
