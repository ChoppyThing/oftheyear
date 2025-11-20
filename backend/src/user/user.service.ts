import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto, UpdatePasswordDto } from './user.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findById(id: number): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByVerificationToken(token: string): Promise<User | null> {
		return this.userRepository.findOne({ where: { verificationToken: token } });
	}

	async updateProfile(id: number, dto: UpdateUserDto): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException('User not found');

		/*if (dto.email && dto.email !== user.email) {
			// check email uniqueness
			const existing = await this.userRepository.findOne({ where: { email: dto.email } });
			if (existing && existing.id !== id) {
				throw new BadRequestException('Email already in use');
			}
			user.email = dto.email.toLowerCase().trim();
		}*/

		if (dto.firstName) user.firstName = dto.firstName;
		if (dto.lastName) user.lastName = dto.lastName;

		return await this.userRepository.save(user);
	}

	async updatePassword(id: number, dto: UpdatePasswordDto): Promise<void> {
		const user = await this.userRepository.findOne({ where: { id }, select: ['id', 'password'] });
		if (!user) throw new NotFoundException('User not found');

		const match = await bcrypt.compare(dto.currentPassword, user.password);
		if (!match) throw new UnauthorizedException('Current password is incorrect');

		const hashed = await bcrypt.hash(dto.newPassword, 10);
		user.password = hashed as any;
		await this.userRepository.save(user);
	}

/*	async verifyAccount(token: string): Promise<User> {
		const user = await this.findByVerificationToken(token);
		if (!user) throw new NotFoundException('Invalid verification token');
		user.isVerified = true;
		user.verificationToken = null;
		return await this.userRepository.save(user);
	}*/
}
