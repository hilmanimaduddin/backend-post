import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { error } from 'console';
const path = require('path');

const prisma = new PrismaClient();

@Injectable()
export class PostService {
  async createPost(userId: string, postData: any): Promise<any> {
    const createdPost = await prisma.post.create({
      data: {
        ...postData,
        user: { connect: { id: userId } },
      },
    });
    return createdPost;
  }

  async getAllPosts(data: any): Promise<any[]> {
    const page = data?.page || 0;
    const count = 10 * page;

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
              contains: data.query,
            },
          },
          {
            caption: {
              contains: data.query,
            },
          },
        ],
      },
      include: {
        user: true,
        likes: true,
      },
    });
    return allPosts;
  }

  async getPostById(postId: string): Promise<any> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    console.log('post', post);

    return post;
  }

  async editPost(postId: string, updatedData: any): Promise<any> {
    const editedPost = await prisma.post.update({
      where: { id: postId },
      data: updatedData,
    });

    return editedPost;
  }

  async deletePost(postId: string): Promise<void> {
    console.log('here', postId);
    try {
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getPostsByUserId(userId: string): Promise<any[]> {
    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
    });
    return posts;
  }

  async getPostsByUser(userId: string, data: any): Promise<any[]> {
    const page = data?.page || 0;
    const count = 10 * page;

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
              contains: data.query,
            },
          },
          {
            caption: {
              contains: data.query,
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
  }

  async toggleLike(
    userId: string,
    postId: string,
    likeStatus: boolean,
  ): Promise<any> {
    const like = await prisma.like.findFirst({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    console.log('like ;;', like);
    console.log('likeStatus', likeStatus);

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
  }

  async uploadImage(
    postId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.userId !== userId) {
      throw new Error('Unauthorized to upload image to this post');
    }

    const imagePath = path.join(`${file.filename}`);

    await prisma.post.update({
      where: { id: postId },
      data: {
        image: imagePath,
      },
    });
  }
}
