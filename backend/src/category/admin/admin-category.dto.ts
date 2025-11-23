import { Type } from 'class-transformer';
import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type as CT } from 'class-transformer';
import { CategoryPhase } from '../category-phase.enum';

export class AdminCreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(2000)
  year: number;

  @IsOptional()
  @IsEnum(CategoryPhase)
  phase?: CategoryPhase;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number = 0;

  @IsOptional()
  @IsObject()
  translations?: {
    fr?: { title?: string; description?: string };
    en?: { title?: string; description?: string };
    es?: { title?: string; description?: string };
    zh?: { title?: string; description?: string };
  };
}

export class AdminUpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(2000)
  @IsOptional()
  year?: number;

  @IsOptional()
  @IsEnum(CategoryPhase)
  phase?: CategoryPhase;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsObject()
  translations?: {
    fr?: { title?: string; description?: string };
    en?: { title?: string; description?: string };
    es?: { title?: string; description?: string };
    zh?: { title?: string; description?: string };
  };
}

export class AdminListCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'year' | 'createdAt' | 'sort' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
