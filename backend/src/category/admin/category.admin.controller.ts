import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { User } from '../../user/user.entity';
import { CategoryAdminService } from './category.admin.service';
import {
  AdminCreateCategoryDto,
  AdminListCategoryDto,
  AdminUpdateCategoryDto,
} from './admin-category.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { VotePhaseOverview } from '../category.dto';

@Controller('admin/category')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryAdminController {
  constructor(private readonly categoryAdminService: CategoryAdminService) {}

  @Get()
  async list(@Query() filters: AdminListCategoryDto) {
    return this.categoryAdminService.list(filters);
  }

  @Get('stats/global')
  async getGlobalStats() {
    return this.categoryAdminService.getGlobalStats();
  }

  @Get('stats/vote-phase')
  async getVotePhaseStats(
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    return this.categoryAdminService.getVotePhaseStats(year);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryAdminService.findOne(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.categoryAdminService.getStats(id);
  }

  @Post()
  async create(
    @Body() createDto: AdminCreateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoryAdminService.create(createDto, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: AdminUpdateCategoryDto,
  ) {
    return this.categoryAdminService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.categoryAdminService.delete(id);
    return { message: 'Category deleted successfully' };
  }
}
