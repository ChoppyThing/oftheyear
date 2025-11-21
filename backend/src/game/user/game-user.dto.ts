import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGameUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  developer: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  editor: string;

  @IsInt()
  @Min(1970)
  @Type(() => Number)
  year: number;
}

export class ListGamesUserQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
