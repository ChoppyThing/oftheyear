import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class LinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  url: string;
}

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  developer: string;

  @IsString()
  @IsNotEmpty()
  editor: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}

export class GameListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

export class UpdateGameCategoryRestrictionsDto {
  @IsArray()
  @IsInt({ each: true })
  categoryIds: number[];
}
