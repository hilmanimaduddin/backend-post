import { z } from 'zod';

export const UpdateUser = z.object({
  name: z.string().max(10).min(3).optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
});

export const ChangePassword = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
  confirmNewPassword: z.string(),
});

export type UpdateUserType = z.infer<typeof UpdateUser>;
export type ChangePasswordType = z.infer<typeof ChangePassword>;
