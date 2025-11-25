import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryNominee } from './category-nominee.entity';
import { Category } from 'src/category/category.entity';
import { Game } from 'src/game/game.entity';
import { GameService } from 'src/game/game.service';
import { CategoryPhase } from 'src/category/category-phase.enum';
import { Status } from 'src/game/status.enum';

@Injectable()
export class CategoryNomineeService {
  constructor(
    @InjectRepository(CategoryNominee)
    private categoryNomineeRepository: Repository<CategoryNominee>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private gameService: GameService,
  ) {}

  /**
   * Récupérer les nominations de l'utilisateur pour une catégorie
   */
  async getUserNominations(categoryId: number, userId: number) {
    const nominations = await this.categoryNomineeRepository.find({
      where: {
        category: { id: categoryId },
        user: { id: userId },
      },
      relations: ['game'],
    });

    return {
      count: nominations.length,
      gameIds: nominations.map((n) => n.game.id),
    };
  }

  /**
   * Ajouter une nomination
   */
  async addNomination(categoryId: number, gameId: number, userId: number) {
    const MAX_NOMINATIONS = 5;

    // 1. Compter les nominations existantes de l'utilisateur
    const existingCount = await this.categoryNomineeRepository.count({
      where: {
        category: { id: categoryId },
        user: { id: userId },
      },
    });

    if (existingCount >= MAX_NOMINATIONS) {
      throw new BadRequestException(
        `Vous avez atteint la limite de ${MAX_NOMINATIONS} nominations`,
      );
    }

    // 2. Vérifier si déjà nominé par cet utilisateur
    const existing = await this.categoryNomineeRepository.findOne({
      where: {
        category: { id: categoryId },
        game: { id: gameId },
        user: { id: userId },
      },
    });

    if (existing) {
      throw new ConflictException('Vous avez déjà nominé ce jeu');
    }

    // 3. Vérifier la catégorie
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    if (category.phase !== CategoryPhase.Nomination) {
      throw new BadRequestException(
        'Les nominations ne sont pas ouvertes pour cette catégorie',
      );
    }

    // 4. Vérifier le jeu
    const game = await this.gameRepository.findOne({
      where: { id: gameId, year: category.year, status: Status.Validated },
    });

    if (!game) {
      throw new NotFoundException('Jeu non trouvé ou non éligible');
    }

    // 5. Vérifier que le jeu est éligible pour cette catégorie (restrictions)
    const eligibleGames = await this.gameService.getGamesForCategory(
      categoryId,
      category.year,
    );
    const isEligible = eligibleGames.some((g) => g.id === gameId);

    if (!isEligible) {
      throw new BadRequestException(
        "Ce jeu n'est pas éligible pour cette catégorie",
      );
    }

    // 6. Créer la nomination
    const nominee = this.categoryNomineeRepository.create({
      category,
      game,
      user: { id: userId },
      nominationCount: 1,
    });

    await this.categoryNomineeRepository.save(nominee);

    return {
      success: true,
      message: 'Nomination ajoutée',
      nominationsCount: existingCount + 1,
      maxNominations: MAX_NOMINATIONS,
    };
  }

  /**
   * Retirer une nomination
   */
  async removeNomination(categoryId: number, gameId: number, userId: number) {
    // 1. Trouver la nomination
    const nominee = await this.categoryNomineeRepository.findOne({
      where: {
        category: { id: categoryId },
        game: { id: gameId },
        user: { id: userId },
      },
    });

    if (!nominee) {
      throw new NotFoundException('Nomination non trouvée');
    }

    // 2. Supprimer la nomination
    await this.categoryNomineeRepository.remove(nominee);

    // 3. Compter les nominations restantes
    const remaining = await this.categoryNomineeRepository.count({
      where: { category: { id: categoryId }, user: { id: userId } },
    });

    return {
      success: true,
      message: 'Nomination retirée',
      nominationsCount: remaining,
      maxNominations: 5,
    };
  }

  async getFinalists(categorySlug: string, year: number) {
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug, year },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const nominations = await this.categoryNomineeRepository.find({
      where: { category: { id: category.id } },
      relations: ['game'],
    });

    // Compter les nominations par jeu
    const voteCounts = nominations.reduce(
      (acc, nomination) => {
        const gameId = nomination.game.id;
        if (!acc[gameId]) {
          acc[gameId] = { game: nomination.game, count: 0 };
        }
        acc[gameId].count++;
        return acc;
      },
      {} as Record<number, { game: Game; count: number }>,
    );

    // Trier et prendre les 5 premiers
    return Object.values(voteCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        game: item.game,
        nominationCount: item.count,
      }));
  }
}
