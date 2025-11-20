import { Controller, Get, Patch, Body, Req, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UpdatePasswordDto } from './user.dto';
import type { Request } from 'express';
import { User } from './user.entity';

/**
 * Jeu TikTok de l'année
 */
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('me')
	async me(@Req() req: Request) {
		const user = (req as any).user as User;
    return this.userService.findById(user.id);
	}

	@Patch('update')
	async update(@Req() req: Request, @Body() dto: UpdateUserDto) {
		const payload: any = (req as any).user;
		const userId = payload?.sub;
		return this.userService.updateProfile(userId, dto);
	}

	@Patch('update-password')
	@HttpCode(204)
	async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
		const payload: any = (req as any).user;
		const userId = payload?.sub;
		await this.userService.updatePassword(userId, dto);
		return;
	}

/*	@Get('verify')
	async verify(@Req() req: Request) {
		const token = (req.query?.token as string) || null;
		if (!token) return { success: false, message: 'Token missing' };
		await this.userService.verifyAccount(token);
		return { success: true };
	}*/
}
