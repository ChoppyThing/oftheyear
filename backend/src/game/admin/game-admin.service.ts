import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../game.entity';
import { Category } from 'src/category/category.entity';
import {
  CreateGameAdminDto,
  ListGamesAdminQueryDto,
  UpdateGameAdminDto,
} from './game-admin.dto';
import { Status } from '../status.enum';
import { User } from 'src/user/user.entity';
import { ImageService } from 'src/common/services/image.service';
import { RevalidationService } from 'src/common/services/revalidation.service';

@Injectable()
export class GameAdminService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly imageService: ImageService,
    private readonly revalidationService: RevalidationService,
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
      .select([
        'game',
        'author.id',
        'author.firstName',
        'author.lastName',
        'author.nickname',
        'author.email',
      ]); // ✅ Ne sélectionner que les champs nécessaires de l'auteur

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
      relations: ['author'],
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }

  /**
   * Créer un nouveau jeu
   */
  async createGame(
    dto: CreateGameAdminDto,
    author: User,
    image?: Express.Multer.File,
  ): Promise<Game> {
    let imagePath: string | undefined;

    if (image) {
      imagePath = await this.imageService.processGameImage(image.path);
    }

    const game = this.gameRepository.create({
      ...dto,
      author,
      image: imagePath,
      status: Status.Validated,
    });

    const savedGame = await this.gameRepository.save(game);

    return savedGame;
  }

  /**
   * Mettre à jour un jeu
   */
  async updateGame(
    id: number,
    dto: UpdateGameAdminDto,
    image?: Express.Multer.File,
  ): Promise<Game> {
    const game = await this.getGameById(id);

    // ✅ Si nouvelle image, traiter et supprimer l'ancienne
    if (image) {
      if (game.image) {
        await this.imageService.deleteImage(game.image).catch(() => {
          // ✅ Ne pas bloquer si l'ancienne image n'existe pas
          console.warn(`Could not delete old image: ${game.image}`);
        });
      }
      game.image = await this.imageService.processGameImage(image.path);
    }

    // ✅ Mettre à jour les champs fournis
    Object.assign(game, dto);

    return await this.gameRepository.save(game);
  }

  /**
   * Supprimer un jeu
   */
  async deleteGame(id: number): Promise<void> {
    const game = await this.getGameById(id);

    // ✅ Supprimer l'image associée
    if (game.image) {
      await this.imageService.deleteImage(game.image).catch(() => {
        console.warn(`Could not delete image: ${game.image}`);
      });
    }

    await this.gameRepository.remove(game);
  }

  /**
   * Approuver un jeu (statut → VALIDATED)
   */
  async approveGame(id: number): Promise<Game> {
    const game = await this.getGameById(id);

    if (game.status === Status.Validated) {
      throw new BadRequestException('Game is already validated');
    }

    game.status = Status.Validated;
    game.publishAt = new Date(); // ✅ Définir la date de publication

    const savedGame = await this.gameRepository.save(game);
    
    // Revalider la page d'accueil pour afficher le nouveau jeu
    await this.revalidationService.revalidateHome();
    
    return savedGame;
  }

  /**
   * Rejeter un jeu (statut → MODERATED)
   */
  async rejectGame(id: number): Promise<Game> {
    const game = await this.getGameById(id);

    if (game.status === Status.Moderated) {
      throw new BadRequestException('Game is already moderated');
    }

    game.status = Status.Moderated;

    return await this.gameRepository.save(game);
  }

  /**
   * Obtenir les statistiques globales des jeux
   */
  async getStats() {
    const [total, validated, sent, moderated] = await Promise.all([
      this.gameRepository.count(),
      this.gameRepository.count({ where: { status: Status.Validated } }),
      this.gameRepository.count({ where: { status: Status.Sent } }),
      this.gameRepository.count({ where: { status: Status.Moderated } }),
    ]);

    return {
      total,
      validated,
      pending: sent,
      rejected: moderated,
    };
  }

  /**
   * Récupérer les restrictions de catégories d'un jeu
   */
  async getCategoryRestrictions(gameId: number) {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['allowedCategories'],
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    return {
      gameId: game.id,
      categoryIds: game.allowedCategories?.map((cat) => cat.id) || [],
      categories: game.allowedCategories || [],
    };
  }

  /**
   * Mettre à jour les restrictions de catégories d'un jeu
   */
  async updateCategoryRestrictions(gameId: number, categoryIds: number[]) {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['allowedCategories'],
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    // Vérifier que toutes les catégories existent
    const categories = await this.categoryRepository.findByIds(categoryIds);
    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('One or more category IDs are invalid');
    }

    // Mettre à jour les catégories autorisées
    game.allowedCategories = categories;
    await this.gameRepository.save(game);

    return {
      gameId: game.id,
      categoryIds: categories.map((cat) => cat.id),
      categories,
    };
  }
}
