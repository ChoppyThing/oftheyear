import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
} from 'src/user/user.dto';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const email = createUserDto.email.toLowerCase().trim();
    const locale = createUserDto.locale || 'en';

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      email,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);

    const token = `${uuidv4()}${uuidv4()}`;
    saved.verificationToken = token;
    await this.userRepository.save(saved);

    try {
      await this.mailService.sendVerificationEmail(
        saved.email,
        saved.firstName,
        token,
        locale,
      );
    } catch (err) {
      console.log(err);
    }

    return saved;
  }

  async login(loginDto: LoginDto): Promise<{
    success: true;
    token: string;
    expiresIn: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      roles: any[];
    };
  }> {
    const email = loginDto.email.toLowerCase().trim();

    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'roles',
        'isVerified',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException({
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };

    const jwtExpires = process.env.JWT_EXPIRES || '1h';
    const expiresInSeconds = parseInt(
      process.env.JWT_EXPIRES_SECONDS || '3600',
      10,
    );

    const token = this.jwtService.sign(payload as any, {
      expiresIn: jwtExpires as any,
    });

    return {
      success: true,
      token,
      expiresIn: expiresInSeconds,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  /**
   * E-mail verify
   */
  async verifyEmail(token: string): Promise<{
    success: true;
    token: string;
    expiresIn: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      roles: any[];
    };
  }> {
    // ✅ Récupérer l'utilisateur
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
      select: ['id', 'firstName', 'lastName', 'email', 'roles', 'isVerified'],
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    // ✅ Mise à jour directe en base (sans recharger l'entité)
    await this.userRepository.update(
      { id: user.id },
      { isVerified: true, verificationToken: null },
    );

    // ✅ Créer le JWT avec les données de l'utilisateur récupéré
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };

    const jwtExpires = process.env.JWT_EXPIRES || '1h';
    const expiresInSeconds = parseInt(
      process.env.JWT_EXPIRES_SECONDS || '3600',
      10,
    );

    const jwtToken = this.jwtService.sign(payload as any, {
      expiresIn: jwtExpires as any,
    });

    return {
      success: true,
      token: jwtToken,
      expiresIn: expiresInSeconds,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const locale = dto.locale || 'fr';
    const email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return;
    }

    const resetToken = `${randomBytes(16).toString('hex')}-${randomBytes(16).toString('hex')}`;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiresAt;
    await this.userRepository.save(user);

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.nickname,
      resetToken,
      locale,
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: dto.token },
    });

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      user.resetPasswordToken = '';
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    user.password = hashedPassword as any;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);
  }
}
