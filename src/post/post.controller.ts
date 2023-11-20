import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostType } from '../zod/post.zod';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createPost(@Req() req, @Body() postData: CreatePostType) {
    const userId = req.user.sub;
    const createdPost = await this.postService.createPost(userId, postData);
    return createdPost;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllPosts(@Req() req) {
    const allPosts = await this.postService.getAllPosts(req.query);
    return allPosts;
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getPostByUser(@Req() req) {
    const userId = req.user.sub;
    const posts = await this.postService.getPostsByUser(userId, req.query);
    return posts;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async editPost(
    @Req() req,
    @Param('id') postId: string,
    @Body() updatedData: any,
  ) {
    const post = await this.postService.getPostById(postId);
    if (!post) {
      return { message: 'Post not found' };
    }
    const userId = req.user.sub;
    if (post.userId !== userId) {
      return { message: 'Unauthorized to edit this post' };
    }
    const editedPost = await this.postService.editPost(postId, updatedData);
    return { message: 'Post edited successfully', post: editedPost };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Param('id') postId: string) {
    const post = await this.postService.getPostById(postId);
    if (!post) {
      return { message: 'Post not found' };
    }
    console.log(post);

    const deletedPost = await this.postService.deletePost(post.id);
    return deletedPost;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getPostById(@Param('id') postId: string) {
    const post = await this.postService.getPostById(postId);

    if (!post) {
      return { message: 'Post not found' };
    }
    return { post };
  }

  @Post('like/:postId')
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Req() req, @Param('postId') postId: string) {
    const userId = req.user.sub;
    const res = await this.postService.toggleLike(userId, postId, true);
    return res;
  }

  @Post('unlike/:postId')
  @UseGuards(AuthGuard('jwt'))
  async dislikePost(@Req() req, @Param('postId') postId: string) {
    const userId = req.user.sub;
    const res = await this.postService.toggleLike(userId, postId, false);
    return res;
  }

  @Get('user/:userId')
  async getPostsByUserId(@Req() req, @Param('userId') userId: string) {
    const posts = await this.postService.getPostsByUserId(userId);
    return posts;
  }

  @Post('upload/:postId')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    console.log('file', file);
    console.log('postId', postId);

    return this.postService.uploadImage(file, postId);
  }
}
