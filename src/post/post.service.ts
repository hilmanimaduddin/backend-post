import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { error } from 'console';
// import path from 'path';
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
    await prisma.post.delete({
      where: { id: postId },
    });
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
  ): Promise<void> {
    const like = await prisma.like.findFirst({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });
    if (like?.liked === likeStatus) {
      throw error('You have already liked this post');
    }

    if (like) {
      await prisma.like.update({
        where: {
          id: like.id,
        },
        data: {
          liked: likeStatus,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          user: { connect: { id: userId } },
          post: { connect: { id: postId } },
          liked: likeStatus,
        },
      });
    }
  }

  async uploadImage(
    postId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    // Pastikan pengguna yang mengunggah gambar adalah pemilik posting (sesuai kebijakan keamanan aplikasi Anda)
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.userId !== userId) {
      // Handle jika posting tidak ditemukan atau pengguna tidak berhak
      throw new Error('Unauthorized to upload image to this post');
    }

    // Implementasikan logika penyimpanan gambar ke dalam postingan (contoh: menyimpan path file di database)
    // const imagePath = path.join(__dirname, `../../uploads/${file.filename}`);
    const imagePath = path.join(`${file.filename}`);
    // Simpan path file gambar ke dalam postingan
    await prisma.post.update({
      where: { id: postId },
      data: {
        image: imagePath,
      },
    });
  }
}
