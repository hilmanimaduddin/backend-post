import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async getUserById(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  }
  async updateUser(userId: string, updatedData: any): Promise<any> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    return updatedUser;
  }

  async changePassword(userId: string, data: any): Promise<void> {
    console.log(userId, data);
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

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
