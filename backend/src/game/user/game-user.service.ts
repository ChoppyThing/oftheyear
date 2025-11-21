import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../game.entity';
import { CreateGameUserDto, ListGamesUserQueryDto } from './game-user.dto';
import { Status } from '../status.enum';
import { User } from 'src/user/user.entity';
import { ImageService } from 'src/common/services/image.service';

@Injectable()
export class GameUserService {
  private readonly MAX_PROPOSALS_PER_YEAR = 5;

  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly imageService: ImageService,
  ) {}

  /**
   * Vérifier combien de jeux l'utilisateur a déjà proposés cette année
   */
  async getProposalsCount(userId: number, year: number): Promise<number> {
    return await this.gameRepository.count({
      where: {
        author: { id: userId },
        year,
        status: Status.Sent,
      },
    });
  }

  /**
   * Vérifier si l'utilisateur peut encore proposer des jeux
   */
  async canPropose(userId: number, year: number): Promise<boolean> {
    const count = await this.getProposalsCount(userId, year);
    return count < this.MAX_PROPOSALS_PER_YEAR;
  }

  /**
   * Créer une proposition de jeu
   */
  async createGameProposal(
    dto: CreateGameUserDto,
    author: User,
    image?: Express.Multer.File,
  ): Promise<Game> {
    // ✅ Vérifier la limite
    const canPropose = await this.canPropose(author.id, dto.year);
    if (!canPropose) {
      throw new ForbiddenException(
        `Vous avez atteint la limite de ${this.MAX_PROPOSALS_PER_YEAR} propositions pour ${dto.year}`,
      );
    }

  const existingGame = await this.gameRepository.findOne({
    where: {
      name: dto.name,
      year: dto.year,
    },
  });

  if (existingGame) {
    throw new BadRequestException(
      `Le jeu "${dto.name}" existe déjà pour l'année ${dto.year}`,
    );
  }

    let imagePath: string | undefined;

    if (image) {
      imagePath = await this.imageService.processGameImage(image.path);
    }

    const game = this.gameRepository.create({
      ...dto,
      author,
      image: imagePath,
      status: Status.Sent, // ✅ En attente de validation
    });

    return await this.gameRepository.save(game);
  }

  /**
   * Lister mes propositions de jeux
   */
  async getMyProposals(
    userId: number,
    query: ListGamesUserQueryDto,
  ): Promise<{ data: Game[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.gameRepository.findAndCount({
      where: {
        author: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtenir les statistiques de mes propositions
   */
  async getMyStats(userId: number, year?: number) {
    const whereClause: any = {
      author: { id: userId },
    };

    if (year) {
      whereClause.year = year;
    }

    const [total, pending, validated, moderated] = await Promise.all([
      this.gameRepository.count({ where: whereClause }),
      this.gameRepository.count({
        where: { ...whereClause, status: Status.Sent },
      }),
      this.gameRepository.count({
        where: { ...whereClause, status: Status.Validated },
      }),
      this.gameRepository.count({
        where: { ...whereClause, status: Status.Moderated },
      }),
    ]);

    const currentYearCount = await this.getProposalsCount(
      userId,
      year || new Date().getFullYear(),
    );

    return {
      total,
      pending,
      validated,
      moderated,
      currentYearCount,
      remainingSlots: this.MAX_PROPOSALS_PER_YEAR - currentYearCount,
    };
  }

  /**
   * Obtenir une proposition spécifique
   */
  async getProposalById(id: number, userId: number): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: {
        id,
        author: { id: userId },
      },
      relations: ['author'],
    });

    if (!game) {
      throw new NotFoundException('Proposition non trouvée');
    }

    return game;
  }

  /**
   * Supprimer ma proposition (seulement si en attente)
   */
  async deleteMyProposal(id: number, userId: number): Promise<void> {
    const game = await this.getProposalById(id, userId);

    if (game.status !== Status.Sent) {
      throw new BadRequestException(
        'Vous ne pouvez supprimer que les propositions en attente',
      );
    }

    // Supprimer l'image si elle existe
    if (game.image) {
      await this.imageService.deleteImage(game.image).catch(() => {
        console.warn(`Could not delete image: ${game.image}`);
      });
    }

    await this.gameRepository.remove(game);
  }
}
