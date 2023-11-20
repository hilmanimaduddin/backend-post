import z from 'zod';

export const CreatePostDto = z.object({
  tags: z.string(),
  caption: z.string().min(5).max(100),
});

export type CreatePostType = z.infer<typeof CreatePostDto>;
