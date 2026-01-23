import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, Min, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class LinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  url: string;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
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
