import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { env } from 'process';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { MulterConfigService } from './multer.middleware';
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import { JwtStrategy } from './user/jwt.strategy';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [
    PassportModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [AppController, UserController, AuthController, PostController],
  providers: [AppService, AuthService, UserService, PostService, JwtStrategy],
})
export class AppModule {}
