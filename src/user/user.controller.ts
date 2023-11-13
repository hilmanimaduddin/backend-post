import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    const userId = req.user.sub;
    const user = this.userService.getUserById(userId);
    console.log(req.user);

    return user;
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req, @Body() updatedData: any) {
    const userId = req.user.sub;

    const updatedUser = await this.userService.updateUser(userId, updatedData);

    return { message: 'Profile updated successfully', user: updatedUser };
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req, @Body() data: string) {
    console.log(' aaaa', data);

    const userId = req.user.sub;

    await this.userService.changePassword(userId, data);

    return { message: 'Password changed successfully' };
  }
}
