import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordType, UpdateUserType } from 'src/zod/user.zod';

@Controller('user')
export class UserController {
  constructor(readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    const userId = req.user.sub;
    return this.userService.getUserById(userId);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req, @Body() updatedData: UpdateUserType) {
    const userId = req.user.sub;
    const updatedUser = await this.userService.updateUser(userId, updatedData);
    return updatedUser;
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req, @Body() data: ChangePasswordType) {
    console.log(' aaaa', data);
    const userId = req.user.sub;
    const user = await this.userService.changePassword(userId, data);
    return user;
  }
}
