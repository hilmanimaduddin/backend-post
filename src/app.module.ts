import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { PostController } from './post/post.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { JwtStrategy } from './user/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { PostService } from './post/post.service';
import { env } from 'process';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ExpressAdapter } from '@nestjs/platform-express';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PassportModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Ganti dengan direktori penyimpanan yang sesuai
        filename: (req, file, callback) => {
          const filename = `${Date.now()}-${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [AppController, UserController, AuthController, PostController],
  providers: [AppService, AuthService, UserService, PostService, JwtStrategy],
})
export class AppModule {}
