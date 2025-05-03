import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as client from 'prom-client';
import { Response } from 'express';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/metrics')
  async prometheHealth(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  }
}
