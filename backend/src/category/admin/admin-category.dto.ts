import { Type } from 'class-transformer';
import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
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
  sortBy?: 'name' | 'year' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
