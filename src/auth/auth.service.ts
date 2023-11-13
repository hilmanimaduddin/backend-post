import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { LoginDto, RegisterDto } from '../../dto/auth.dto';
const path = require('path');

const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  private readonly blacklist: Set<string> = new Set();
  getHello(): string {
    return 'Hello World!';
  }

  async register(registerDto: RegisterDto) {
    try {
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
      throw error;
    }
  }

  async login(LoginDto: LoginDto) {
    const { email, password } = LoginDto;
    try {
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
      throw { error: 'Login failed', message: error };
    }
  }

  async uploadImage(userId: string, file: Express.Multer.File): Promise<void> {
    // Implementasikan logika penyimpanan gambar ke dalam profil pengguna (contoh: menyimpan path file di database)
    // const imagePath = path.join(__dirname, `../../uploads/${file.filename}`);
    const imagePath = path.join(`${file.filename}`);
    // Simpan path file gambar ke dalam profil pengguna
    await prisma.user.update({
      where: { id: userId },
      data: {
        photo: imagePath,
      },
    });
  }
}
