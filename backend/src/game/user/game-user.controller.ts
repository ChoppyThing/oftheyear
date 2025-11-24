import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/user/user.entity';
import { GameUserService } from './game-user.service';
import { CreateGameUserDto, ListGamesUserQueryDto } from './game-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { multerConfig } from 'src/common/config/multer.config';

@Controller('games/user')
@UseGuards(JwtAuthGuard)
export class GameUserController {
  constructor(private readonly gameUserService: GameUserService) {}

  /**
   * Vérifier si je peux proposer un jeu
   */
  @Get('can-propose')
  async canPropose(@CurrentUser() user: User, @Query('year', ParseIntPipe) year: number) {
    const canPropose = await this.gameUserService.canPropose(user.id, year);
    const count = await this.gameUserService.getProposalsCount(user.id, year);
    
    return {
      canPropose,
      currentCount: count,
      maxAllowed: 5,
      remaining: 5 - count,
    };
  }

  /**
   * Rechercher des jeux existants par nom
   */
  @Get('search')
  async searchGames(@Query('query') query: string) {
    if (!query || query.length < 5) {
      return [];
    }
    return this.gameUserService.searchExistingGames(query);
  }

  /**
   * Créer une proposition de jeu
   */
  @Post()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async createProposal(
    @Body() dto: CreateGameUserDto,
    @CurrentUser() user: User,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.gameUserService.createGameProposal(dto, user, image);
  }

  /**
   * Lister mes propositions
   */
  @Get('my-proposals')
  async getMyProposals(@CurrentUser() user: User, @Query() query: ListGamesUserQueryDto) {
    return this.gameUserService.getMyProposals(user.id, query);
  }

  /**
   * Obtenir mes statistiques
   */
  @Get('stats')
  async getMyStats(@CurrentUser() user: User, @Query('year') year?: number) {
    return this.gameUserService.getMyStats(user.id, year);
  }

  /**
   * Obtenir une proposition spécifique
   */
  @Get('my-proposals/:id')
  async getProposalById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.gameUserService.getProposalById(id, user.id);
  }

  /**
   * Supprimer ma proposition
   */
  @Delete('my-proposals/:id')
  async deleteProposal(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.gameUserService.deleteMyProposal(id, user.id);
    return { message: 'Proposition supprimée avec succès' };
  }
}
