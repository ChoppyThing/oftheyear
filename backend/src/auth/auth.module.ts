import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RecaptchaService } from './recaptcha.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES') as any },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RecaptchaService],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
