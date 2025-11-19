import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
