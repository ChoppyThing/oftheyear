import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
} from 'src/user/user.dto';
import { Public } from './public.decorator';
import { RecaptchaService } from './recaptcha.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Valider le token reCAPTCHA
    await this.recaptchaService.verifyToken(
      createUserDto.recaptchaToken,
      'register',
    );
    return await this.authService.createUser(createUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Valider le token reCAPTCHA
    await this.recaptchaService.verifyToken(loginDto.recaptchaToken, 'login');
    return await this.authService.login(loginDto);
  }

  @Public()
  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }
    return await this.authService.verifyEmail(token);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    };
  }
}
