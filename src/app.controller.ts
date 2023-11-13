import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
const path = require('path');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('display/:filename')
  display(@Res() res, @Param('filename') filename: string) {
    try {
      res.sendFile(filename, {
        root: './uploads',
      });
    } catch (error) {
      console.log(error);
    }
  }
}
