import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateLoginDtoType, CreateRegisterDtoType } from 'src/zod/auth.zod';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // constructor(private readonly cloudinaryService: CloudinaryService) {}
  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Post('register')
  async register(@Body() registerDto: CreateRegisterDtoType) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: CreateLoginDtoType) {
    return this.authService.login(loginDto);
  }

  @Get('check')
  @UseGuards(AuthGuard('jwt'))
  async check(@Req() req) {
    return req?.user;
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    console.log('file', file);

    return this.authService.uploadImage(file, req.user.sub);
  }
}
