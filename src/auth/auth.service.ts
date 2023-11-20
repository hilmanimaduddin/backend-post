import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import {
  CreateLoginDto,
  CreateLoginDtoType,
  CreateRegisterDto,
  CreateRegisterDtoType,
} from 'zod/auth.zod';
const path = require('path');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  private readonly blacklist: Set<string> = new Set();

  getHello(): string {
    return 'Hello World!';
  }

  async register(registerDto: CreateRegisterDtoType) {
    try {
      CreateRegisterDto.parse(registerDto);
      const { name, username, email, password } = registerDto;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      const cekUsername = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (user) {
        throw new Error('User already exists');
      }

      if (cekUsername) {
        throw new Error('Username already exists');
      }

      const post = await prisma.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
        },
      });

      return { message: 'Registrasi berhasil', data: post };
    } catch (error) {
      console.error('Error registering user:', error);
      return { error: 'Registrasi gagal', message: error };
    }
  }

  async login(LoginDto: CreateLoginDtoType) {
    const { email, password } = LoginDto;
    try {
      CreateLoginDto.parse(LoginDto);
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new Error('Invalid password');
      }

      const payload = {
        sub: user.id,
        username: user.username,
        email: user.email,
      };

      const access_token = await this.jwtService.signAsync(payload);

      return {
        respone: 'Login successful',
        data: user,
        access_token,
      };
    } catch (error) {
      return { error: 'Login failed', message: error };
    }
  }

  async uploadImage(file: Express.Multer.File, userId: string) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(file.buffer);
      });

      console.log('result', result);

      if (result.secure_url) {
        const post = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            photo: result.secure_url,
          },
        });
        return post;
      }

      const imageUrl = result?.secure_url;

      return imageUrl;
    } catch (error) {
      console.log('Error uploading image:', error);
      return error;
    }
  }
}
