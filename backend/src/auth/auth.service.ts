import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginDto } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

    // generate double-uuid verification token
    const token = `${uuidv4()}${uuidv4()}`;
    saved.verificationToken = token;
    await this.userRepository.save(saved);

    // send verification email (do not block on failure)
    try {
      await this.mailService.sendVerificationEmail(saved.email, saved.firstName, token);
    } catch (err) {
      // log only, do not fail registration
      // If desired, handle retries or persist a failed flag
    }

    return saved;
  }
  
  async login(
    loginDto: LoginDto,
  ): Promise<{
    success: true;
    token: string;
    expiresIn: number;
    user: { id: number; firstName: string; lastName: string; email: string; roles: any[] };
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
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // generate JWT token and include user info in payload
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };

    const jwtExpires = process.env.JWT_EXPIRES || '1h';
    const expiresInSeconds = parseInt(process.env.JWT_EXPIRES_SECONDS || '3600', 10);

    const token = this.jwtService.sign(payload as any, { expiresIn: jwtExpires as any });

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
  
}
