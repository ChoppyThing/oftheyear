import { Body, Controller, Get, Param, Post, Query, Request, BadRequestException } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { GameService } from './game.service';
import { CreateGameDto, GameListQueryDto } from './game.dto';
import { Game } from './game.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/user.entity';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /**
   * Liste les jeux par année
   * GET /game?year=2024
   */
  @Public()
  @Get()
  async getList(@Query() query: GameListQueryDto): Promise<Game[]> {
    return await this.gameService.findByYear(query.year);
  }

  /**
   * Récupère les derniers jeux validés
   * GET /game/latest?limit=3
   */
  @Public()
  @Get('latest')
  async getLatest(@Query('limit') limit?: number): Promise<Game[]> {
    return await this.gameService.findLatest(limit || 3);
  }

  /**
   * Récupère un jeu par son ID
   * GET /game/:id
   */
  @Public()
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Game> {
    const parsed = Number(id);
    if (!isNaN(parsed) && parsed > 0) {
      return await this.gameService.findOne(parsed);
    }

    // If the param is not a positive number, try to resolve as slug
    return await this.gameService.findBySlug(id);
  }

  /**
   * Permet à un utilisateur de proposer un jeu
   * POST /game
   * Nécessite une authentification
   */
  @Post()
  async proposeGame(
    @Body() createGameDto: CreateGameDto,
    @CurrentUser() user: User,
  ): Promise<Game> {
    return await this.gameService.proposeGame(createGameDto, user);
  }
}
