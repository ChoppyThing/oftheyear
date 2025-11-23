import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

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
}

export class GameListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
