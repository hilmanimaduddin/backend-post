import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { CreatePostDto } from '../zod/post.zod';
const path = require('path');

const prisma = new PrismaClient();

@Injectable()
export class PostService {
  async createPost(userId: string, postData: any): Promise<any> {
    try {
      CreatePostDto.parse(postData);
      const createdPost = await prisma.post.create({
        data: {
          ...postData,
          user: { connect: { id: userId } },
        },
      });
      return { message: 'Post created successfully', post: createdPost };
    } catch (error) {
      console.log(error);
      return { error: 'Post creation failed', message: error };
    }
  }

  async getAllPosts(data: any) {
    const page = data?.page || 0;
    const query = data?.query || '';
    const count = 10 * page;
    try {
      const allPosts = await prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        skip: count,
        where: {
          OR: [
            {
              tags: {
                contains: query,
              },
            },
            {
              caption: {
                contains: query,
              },
            },
          ],
        },
        include: {
          user: true,
          likes: true,
        },
      });
      return { message: 'Posts fetched successfully', posts: allPosts };
    } catch (error) {
      console.log(error);
      return { error: 'Failed to fetch posts', message: error };
    }
  }

  async getPostById(postId: string): Promise<any> {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });
      console.log('post', post);

      return post;
    } catch (error) {
      console.log(error);
      return { error: 'Post not found', message: error };
    }
  }

  async editPost(postId: string, updatedData: any): Promise<any> {
    try {
      const editedPost = await prisma.post.update({
        where: { id: postId },
        data: updatedData,
      });

      return editedPost;
    } catch (error) {
      console.log(error);
      return { error: 'Post edit failed', message: error };
    }
  }

  async deletePost(postId: string): Promise<any> {
    console.log('here', postId);
    try {
      const deletedPost = await prisma.post.delete({
        where: {
          id: postId,
        },
      });
      return { message: 'Post deleted successfully', post: deletedPost };
    } catch (error) {
      console.log(error);
      return { error: 'Post deletion failed', message: error };
    }
  }

  async getPostsByUserId(userId: string): Promise<any> {
    try {
      const posts = await prisma.post.findMany({
        where: {
          userId: userId,
        },
      });
      return { message: 'Posts fetched successfully', posts: posts };
    } catch (error) {
      console.log(error);
      return { error: 'Failed to fetch posts', message: error };
    }
  }

  async getPostsByUser(userId: string, data: any) {
    const page = data?.page || 0;
    const query = data?.query || '';
    const count = 10 * page;
    try {
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        skip: count,
        where: {
          user: {
            id: userId,
          },
          OR: [
            {
              tags: {
                contains: query,
              },
            },
            {
              caption: {
                contains: query,
              },
            },
          ],
        },
        include: {
          user: true,
          likes: true,
        },
      });
      return posts;
    } catch (error) {
      console.log(error);
      return { error: 'Failed to fetch posts', message: error };
    }
  }

  async toggleLike(
    userId: string,
    postId: string,
    likeStatus: boolean,
  ): Promise<any> {
    console.log({ userId, postId, likeStatus });

    const like = await prisma.like.findFirst({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });
    try {
      if (!like) {
        await prisma.like.create({
          data: {
            user: { connect: { id: userId } },
            post: { connect: { id: postId } },
            liked: likeStatus,
          },
        });
        return {
          message: 'Like created successfully',
        };
      } else if (like?.liked === likeStatus) {
        const deletedLike = await prisma.like.delete({
          where: {
            id: like.id,
          },
        });
        return {
          message: 'Like deleted successfully',
        };
      } else if (like?.liked !== likeStatus) {
        await prisma.like.update({
          where: {
            id: like.id,
          },
          data: {
            liked: likeStatus,
          },
        });
        return {
          message: 'Like updated successfully',
        };
      }
    } catch (error) {
      console.log(error);
      return { error: 'Failed to like post', message: error };
    }
  }

  async uploadImage(file: Express.Multer.File, postId: string) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(file.buffer);
      });

      console.log('result', result);

      if (result.secure_url) {
        const post = await prisma.post.update({
          where: { id: postId },
          data: {
            image: result.secure_url,
          },
        });
        return post;
      }

      const imageUrl = result?.secure_url;

      return imageUrl;
    } catch (error) {
      console.log('Error uploading image:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }
}
