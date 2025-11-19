import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/user.entity';
import { Public } from 'src/auth/public.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return await this.categoryService.create(createCategoryDto, user);
  }

  @Public()
  @Get()
  async findAll(): Promise<Category[]> {
    return await this.categoryService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return await this.categoryService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Category> {
    return await this.categoryService.findBySlug(slug);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return await this.categoryService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.categoryService.remove(id);
  }
}
