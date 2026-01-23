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
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { GameAdminService } from './game-admin.service';
import { CreateGameAdminDto, ListGamesAdminQueryDto, UpdateGameAdminDto } from './game-admin.dto';
import { UpdateGameCategoryRestrictionsDto } from '../game.dto';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { multerConfig } from 'src/common/config/multer.config';

@Injectable()
class ParseLinksPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value === 'object' && value.links && typeof value.links === 'string') {
      try {
        value.links = JSON.parse(value.links as string);
      } catch (e) {
        // leave as-is, let validation handle it
      }
    }
    return value;
  }
}

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
   * Statistiques globales des jeux
   * GET /admin/games/stats
   */
  @Get('stats')
  async getStats() {
    return this.gameAdminService.getStats();
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
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async createGame(
    @Body() body: any,
    @CurrentUser() user: User,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (typeof body.year === 'string') {
      body.year = parseInt(body.year, 10);
    }
    if (body.links && typeof body.links === 'string') {
      try {
        body.links = JSON.parse(body.links as string);
      } catch (e) {
        // leave as-is
      }
    }

    const dto = plainToInstance(CreateGameAdminDto, body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: false });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.gameAdminService.createGame(dto, user, image);
  }

  /**
   * Mettre à jour un jeu
   * PATCH /admin/games/:id
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async updateGame(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (body.year && typeof body.year === 'string') {
      body.year = parseInt(body.year, 10);
    }
    if (body.links && typeof body.links === 'string') {
      try {
        body.links = JSON.parse(body.links as string);
      } catch (e) {
        // leave as-is
      }
    }

    const dto = plainToInstance(UpdateGameAdminDto, body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: false });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.gameAdminService.updateGame(id, dto, image);
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

  /**
   * Récupérer les restrictions de catégories d'un jeu
   * GET /admin/games/:id/category-restrictions
   */
  @Get(':id/category-restrictions')
  async getCategoryRestrictions(@Param('id') id: number) {
    return this.gameAdminService.getCategoryRestrictions(id);
  }

  /**
   * Mettre à jour les restrictions de catégories d'un jeu
   * PUT /admin/games/:id/category-restrictions
   */
  @Patch(':id/category-restrictions')
  async updateCategoryRestrictions(
    @Param('id') id: number,
    @Body() dto: UpdateGameCategoryRestrictionsDto,
  ) {
    return this.gameAdminService.updateCategoryRestrictions(id, dto.categoryIds);
  }
}
