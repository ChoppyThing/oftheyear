import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
  Get,
  Body,
  Query,
} from '@nestjs/common';
import { CategoryNomineeService } from './category-nominee.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/user.entity';

@Controller('category-nominee')
@UseGuards(JwtAuthGuard)
export class CategoryNomineeController {
  constructor(
    private readonly categoryNomineeService: CategoryNomineeService,
  ) {}

  @Get(':categoryId/user-nominations')
  async getUserNominations(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @CurrentUser() user: User,
  ) {
    return this.categoryNomineeService.getUserNominations(categoryId, user.id);
  }

  @Post('nominate')
  async addNomination(
    @Body('categoryId') categoryId: number,
    @Body('gameId') gameId: number,
    @CurrentUser() user: User,
  ) {
    return this.categoryNomineeService.addNomination(
      categoryId,
      gameId,
      user.id,
    );
  }

  @Delete('remove/:categoryId/:gameId')
  async removeNomination(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('gameId', ParseIntPipe) gameId: number,
    @CurrentUser() user: User,
  ) {
    return this.categoryNomineeService.removeNomination(
      categoryId,
      gameId,
      user.id,
    );
  }

  @Get('category/:slug/finalists')
  async getFinalists(@Param('slug') slug: string, @Query('year') year: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.categoryNomineeService.getFinalists(slug, yearNum);
  }
}
