import { IsOptional, IsString, IsInt, Min, IsEnum, IsUrl, IsNotEmpty, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  url: string;
}
import { Status } from '../status.enum';

export class ListGamesAdminQueryDto {
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
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  developer?: string;

  @IsOptional()
  @IsString()
  editor?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorId?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class CreateGameAdminDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  developer?: string;

  @IsOptional()
  @IsString()
  editor?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1980)
  year: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

/*
  @IsOptional()
  @IsUrl()
  image?: string;
*/

  @IsOptional()
  @Type(() => Date)
  publishedAt?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}

export class UpdateGameAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
/*
  @IsOptional()
  @IsUrl()
  image?: string;
*/
  @IsOptional()
  @IsString()
  developer?: string;

  @IsOptional()
  @IsString()
  editor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1980)
  year?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}
