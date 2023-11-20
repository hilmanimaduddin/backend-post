import z from 'zod';

export const CreateRegisterDto = z.object({
  name: z.string().max(10).min(5),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const CreateLoginDto = z
  .object({
    email: z.string().min(5).email(),
    password: z.string().min(4),
  })
  .required();

export type CreateRegisterDtoType = z.infer<typeof CreateRegisterDto>;
export type CreateLoginDtoType = z.infer<typeof CreateLoginDto>;
