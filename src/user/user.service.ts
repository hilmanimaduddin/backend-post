import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ChangePasswordType,
  UpdateUser,
  UpdateUserType,
} from 'src/zod/user.zod';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async getUserById(userId: string): Promise<UpdateUserType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  }
  async updateUser(
    userId: string,
    updatedData: UpdateUserType,
  ): Promise<UpdateUserType> {
    try {
      UpdateUser.parse(updatedData);
      console.log('updateData', updatedData);
      console.log('userId', userId);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
      });

      return updatedUser;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async changePassword(userId: string, data: ChangePasswordType) {
    console.log(userId, data);
    try {
      const { oldPassword, newPassword, confirmNewPassword } = data;

      if (newPassword !== confirmNewPassword) {
        throw new Error('New password and confirm new password do not match');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      } else if (!bcrypt.compareSync(oldPassword, user.password)) {
        throw new Error('Old password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      console.log(hashedPassword);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      return { 'Password changed successfully': updatedUser };
    } catch (error) {
      console.log('sgdiuqshud', error);
      return { error: 'Password change failed', message: error };
    }
  }
}
