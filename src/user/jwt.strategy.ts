// jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface'; // Buat interface ini untuk mendefinisikan payload JWT
import { env } from 'process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET, // Ganti dengan kunci rahasia yang sesuai dengan yang Anda gunakan untuk menandatangani token
    });
  }

  async validate(payload: JwtPayload) {
    // Di sini, Anda dapat mengecek payload dan mengembalikan pengguna berdasarkan informasi payload
    // Misalnya, mencari pengguna berdasarkan ID atau email dari database

    // Contoh sederhana:
    // const user = await this.userService.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException('Invalid token');
    // }

    return payload;
  }
}
