import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Role } from './role.enum';
import { Exclude, Expose } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  //@IsOptional()
  //@IsEmail()
  //email?: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  nickname: string;

  @Expose()
  email: string;

  @Expose()
  roles: Role[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}