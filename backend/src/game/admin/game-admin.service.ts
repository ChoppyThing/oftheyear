import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../game.entity';
import {
  CreateGameAdminDto,
  ListGamesAdminQueryDto,
  UpdateGameAdminDto,
} from './game-admin.dto';
import { Status } from '../status.enum';
import { User } from 'src/user/user.entity';

@Injectable()
export class GameAdminService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  /**
   * Liste paginée avec filtres
   */
  async listGames(query: ListGamesAdminQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      name,
      developer,
      editor,
      status,
      authorId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;
    const queryBuilder = this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.author', 'author')

    // Recherche globale
    if (search) {
      queryBuilder.andWhere(
        '(game.name ILIKE :search OR game.developer ILIKE :search OR game.editor ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtres spécifiques
    if (name) {
      queryBuilder.andWhere('game.name ILIKE :name', { name: `%${name}%` });
    }

    if (developer) {
      queryBuilder.andWhere('game.developer ILIKE :developer', {
        developer: `%${developer}%`,
      });
    }

    if (editor) {
      queryBuilder.andWhere('game.editor ILIKE :editor', {
        editor: `%${editor}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('game.status = :status', { status });
    }

    if (authorId) {
      queryBuilder.andWhere('game.authorId = :authorId', { authorId });
    }

    // Tri
    const validSortFields = [
      'id',
      'name',
      'developer',
      'editor',
      'status',
      'createdAt',
      'updatedAt',
      'publishAt',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`game.${sortField}`, sortOrder);

    queryBuilder.skip(skip).take(limit);

    const [games, total] = await queryBuilder.getManyAndCount();

    return {
      data: games,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer un jeu par ID
   */
  async getGameById(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id },
      relations: ['author', 'categories'],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async createGame(
    createGameDto: CreateGameAdminDto,
    user: User,
  ): Promise<Game> {
    const game = this.gameRepository.create({
      ...createGameDto,
      author: user, // ← Ajouter l'auteur
      status: Status.Validated,
    });

    return this.gameRepository.save(game);
  }

  /**
   * Mettre à jour un jeu
   */
  async updateGame(id: number, dto: UpdateGameAdminDto): Promise<Game> {
    const game = await this.getGameById(id);

    // Vérifier l'unicité du nom si modifié
    if (dto.name && dto.name !== game.name) {
      const existing = await this.gameRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new BadRequestException('A game with this name already exists');
      }
      game.name = dto.name;
    }

    if (dto.image) game.image = dto.image;
    if (dto.developer) game.developer = dto.developer;
    if (dto.editor) game.editor = dto.editor;
    if (dto.status) game.status = dto.status;

    return await this.gameRepository.save(game);
  }

  /**
   * Supprimer un jeu
   */
  async deleteGame(id: number): Promise<void> {
    const game = await this.getGameById(id);
    await this.gameRepository.remove(game);
  }

  /**
   * Approuver un jeu (statut → APPROVED)
   */
  async approveGame(id: number): Promise<Game> {
    return this.updateGame(id, { status: Status.Validated });
  }

  /**
   * Rejeter un jeu (statut → REJECTED)
   */
  async rejectGame(id: number): Promise<Game> {
    return this.updateGame(id, { status: Status.Moderated });
  }
}
