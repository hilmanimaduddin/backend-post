import { Injectable } from '@nestjs/common';
const path = require('path');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
