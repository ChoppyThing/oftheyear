import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { CategoryPhase } from './category-phase.enum';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export interface CategoryVoteStats {
  categoryId: number;
  categoryName: string;
  totalVotes: number;
  nominees: {
    id: number;
    gameId: number;
    gameName: string;
    voteCount: number;
    percentage: number;
  }[];
}

export interface VotePhaseOverview {
  totalCategories: number;
  totalVotes: number;
  categories: CategoryVoteStats[];
}

export class CreateCategoryProposalDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La description ne peut pas dépasser 500 caractères' })
  description?: string;

  @IsNotEmpty({ message: "L'année est requise" })
  @IsInt({ message: "L'année doit être un nombre entier" })
  @Min(2000, { message: "L'année doit être au minimum 2000" })
  @Max(new Date().getFullYear() + 1, { message: "L'année ne peut pas être dans le futur" })
  year: number;
}

export class CategoryProposalFiltersDto {
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
  @IsIn(Object.values(CategoryPhase))
  phase?: CategoryPhase;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
