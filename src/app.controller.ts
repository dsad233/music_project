import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as client from 'prom-client';
import { Response } from 'express';
import { Public } from './utils/decorator/isPublic.decorator';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  // prometheus 로그 기록 API
  @Public()
  @Get('/metrics')
  async prometheHealth(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  }
}
