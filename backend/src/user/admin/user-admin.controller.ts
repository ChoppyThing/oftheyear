import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, ParseIntPipe } from '@nestjs/common';
import { UserAdminService } from './user-admin.service';
import { ListUsersQueryDto, UpdateUserAdminDto } from './user-admin.dto';
import { AdminGuard } from '../../auth/guards/admin.guard';

@Controller('admin/users')
@UseGuards(AdminGuard)
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  /**
   * Liste paginée et filtrée des utilisateurs
   * GET /admin/users?page=1&limit=10&search=john&role=admin
   */
  @Get()
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.userAdminService.listUsers(query);
  }

  /**
   * Statistiques des utilisateurs
   * GET /admin/users/stats
   */
  @Get('stats')
  async getStats() {
    return this.userAdminService.getStats();
  }

  /**
   * Récupérer un utilisateur par ID
   * GET /admin/users/:id
   */
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userAdminService.getUserById(id);
  }

  /**
   * Mettre à jour un utilisateur (y compris les roles)
   * PATCH /admin/users/:id
   */
  @Patch(':id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserAdminDto) {
    return this.userAdminService.updateUser(id, dto);
  }

  /**
   * Supprimer un utilisateur
   * DELETE /admin/users/:id
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userAdminService.deleteUser(id);
  }
}
