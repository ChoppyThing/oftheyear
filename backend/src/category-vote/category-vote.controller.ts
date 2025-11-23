import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { CategoryVoteService } from './category-vote.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from 'src/auth/public.decorator';

@Controller('category-vote')
export class CategoryVoteController {
  constructor(private readonly categoryVoteService: CategoryVoteService) {}

  @UseGuards(JwtAuthGuard)
  @Post('category/:slug/vote')
  async vote(
    @Param('slug') slug: string,
    @Body('gameId') gameId: number,
    @Query('year') year: string,
    @Request() req,
  ) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.categoryVoteService.vote(slug, gameId, req.user, yearNum);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('category/:slug/vote')
  async removeVote(
    @Param('slug') slug: string,
    @Query('year') year: string,
    @Request() req,
  ) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.categoryVoteService.removeVote(slug, req.user, yearNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('category/:slug/my-vote')
  async getMyVote(
    @Param('slug') slug: string,
    @Query('year') year: string,
    @Request() req,
  ) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.categoryVoteService.getMyVote(slug, req.user, yearNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-voted-categories')
  async getMyVotedCategories(@Query('year') year: string, @Request() req) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.categoryVoteService.getMyVotedCategories(req.user, yearNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('category/:slug/stats')
  async getVoteStats(
    @Param('slug') slug: string,
    @Query('year') year: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.categoryVoteService.getVoteStats(slug, yearNum);
  }
}
