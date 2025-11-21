import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  Post,
} from '@nestjs/common';
import { GameAdminService } from './game-admin.service';
import { CreateGameAdminDto, ListGamesAdminQueryDto, UpdateGameAdminDto } from './game-admin.dto';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('admin/games')
@UseGuards(AdminGuard)
export class GameAdminController {
  constructor(private readonly gameAdminService: GameAdminService) {}

  /**
   * Liste paginée et filtrée des jeux
   * GET /admin/games?page=1&limit=10&status=sent&search=zelda
   */
  @Get()
  async listGames(@Query() query: ListGamesAdminQueryDto) {
    return this.gameAdminService.listGames(query);
  }

  /**
   * Récupérer un jeu par ID
   * GET /admin/games/:id
   */
  @Get(':id')
  async getGameById(@Param('id') id: number) {
    return this.gameAdminService.getGameById(id);
  }

  @Post()
  async createGame(
    @Body() createGameDto: CreateGameAdminDto,
    @CurrentUser() user: User,
  ) {
    return this.gameAdminService.createGame(createGameDto, user);
  }

  /**
   * Mettre à jour un jeu
   * PATCH /admin/games/:id
   */
  @Patch(':id')
  async updateGame(@Param('id') id: number, @Body() dto: UpdateGameAdminDto) {
    return this.gameAdminService.updateGame(id, dto);
  }

  /**
   * Supprimer un jeu
   * DELETE /admin/games/:id
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteGame(@Param('id') id: number) {
    await this.gameAdminService.deleteGame(id);
  }

  /**
   * Approuver un jeu
   * POST /admin/games/:id/approve
   */
  @Post(':id/approve')
  async approveGame(@Param('id') id: number) {
    return this.gameAdminService.approveGame(id);
  }

  /**
   * Rejeter un jeu
   * POST /admin/games/:id/reject
   */
  @Post(':id/reject')
  async rejectGame(@Param('id') id: number) {
    return this.gameAdminService.rejectGame(id);
  }
}
