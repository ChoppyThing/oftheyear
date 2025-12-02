import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../user.entity';
import { ListUsersQueryDto, UpdateUserAdminDto } from './user-admin.dto';

@Injectable()
export class UserAdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async listUsers(query: ListUsersQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      firstName,
      lastName,
      nickname,
      email,
      role,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.nickname ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (firstName) {
      queryBuilder.andWhere('user.firstName ILIKE :firstName', { firstName: `%${firstName}%` });
    }

    if (lastName) {
      queryBuilder.andWhere('user.lastName ILIKE :lastName', { lastName: `%${lastName}%` });
    }

    if (nickname) {
      queryBuilder.andWhere('user.nickname ILIKE :nickname', { nickname: `%${nickname}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (role) {
      queryBuilder.andWhere(':role = ANY(user.roles)', { role });
    }

    const validSortFields = ['id', 'firstName', 'lastName', 'nickname', 'email', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    // Utility: mask last name showing only first two chars then asterisks
    const maskLastName = (lastName?: string | null) => {
      if (!lastName) return '';
      const trimmed = lastName.trim();
      if (trimmed.length <= 2) return trimmed;
      return trimmed.slice(0, 2) + '*'.repeat(trimmed.length - 2);
    };

    // Utility: mask email according to rules:
    // - show up to first two chars of each alphanumeric segment
    // - keep separators ('.' and '_' and '@') and reveal following segment's first two chars
    // - for short segments (<=2) show them as-is
    const maskEmail = (email?: string | null) => {
      if (!email) return '';
      const parts: string[] = [];
      // We'll split into sequences of word chars and separators
      const tokens = email.split(/([._@])/g);
      for (const token of tokens) {
        if (token === '.' || token === '_' || token === '@') {
          parts.push(token);
          continue;
        }
        // token is an alphanumeric sequence (or domain part)
        if (token.length <= 2) {
          parts.push(token);
        } else {
          parts.push(token.slice(0, 2) + '*'.repeat(token.length - 2));
        }
      }
      return parts.join('');
    };

    // Sanitize users before returning to admin UI to comply with GDPR
    const sanitized = users.map((u) => ({
      id: u.id,
      firstName: u.firstName || '',
      lastName: maskLastName(u.lastName),
      nickname: u.nickname,
      email: maskEmail(u.email),
      roles: u.roles,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      data: sanitized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: number, dto: UpdateUserAdminDto): Promise<User> {
    const user = await this.getUserById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
      user.email = dto.email.toLowerCase().trim();
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.nickname) user.nickname = dto.nickname;
    if (dto.roles) user.roles = dto.roles;
    if (dto.isVerified !== undefined) user.isVerified = dto.isVerified;

    return await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
  }

  async getStats() {
    const [total, verified, unverified] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isVerified: true } }),
      this.userRepository.count({ where: { isVerified: false } }),
    ]);

    return {
      total,
      verified,
      unverified,
    };
  }
}
