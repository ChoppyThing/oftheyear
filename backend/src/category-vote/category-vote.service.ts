import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryVote } from './category-vote.entity';
import { Category } from '../category/category.entity';
import { Game } from '../game/game.entity';
import { User } from '../user/user.entity';
import { CategoryNominee } from '../category-nominee/category-nominee.entity';
import { CategoryPhase } from 'src/category/category-phase.enum';

@Injectable()
export class CategoryVoteService {
  constructor(
    @InjectRepository(CategoryVote)
    private categoryVoteRepository: Repository<CategoryVote>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(CategoryNominee)
    private categoryNomineeRepository: Repository<CategoryNominee>,
  ) {}

  // Voter pour un jeu (1 seul vote par catégorie)
  async vote(
    categorySlug: string,
    gameId: number,
    user: User,
    year: number,
  ): Promise<CategoryVote> {
    // Vérifier que la catégorie existe et est en phase Vote
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug, year },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Vérifier que le jeu existe
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Vérifier que le jeu est bien dans les 5 finalistes
    const finalists = await this.getFinalists(category.id);
    const isFinalist = finalists.some((f) => f.game.id === gameId);

    if (!isFinalist) {
      throw new BadRequestException(
        'This game is not among the finalists for this category',
      );
    }

    // Supprimer le vote précédent s'il existe (1 seul vote autorisé)
    await this.categoryVoteRepository.delete({
      user: { id: user.id },
      category: { id: category.id },
    });

    // Créer le nouveau vote
    const categoryVote = this.categoryVoteRepository.create({
      user,
      category,
      game,
    });

    return await this.categoryVoteRepository.save(categoryVote);
  }

  // Supprimer mon vote
  async removeVote(categorySlug: string, user: User, year: number) {
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug, year },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryVoteRepository.delete({
      user: { id: user.id },
      category: { id: category.id },
    });

    return { message: 'Vote removed successfully' };
  }

  // Mon vote pour une catégorie
  async getMyVote(categorySlug: string, user: User, year: number) {
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug, year },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const vote = await this.categoryVoteRepository.findOne({
      where: {
        user: { id: user.id },
        category: { id: category.id },
      },
      relations: ['game'],
    });

    // Retourner un objet vide au lieu de null
    if (!vote) {
      return { voted: false, game: null };
    }

    return {
      voted: true,
      game: {
        id: vote.game.id,
        name: vote.game.name,
        image: vote.game.image,
      },
    };
  }

  // Liste des catégories que j'ai votées
  async getMyVotedCategories(user: User, year: number) {
    const votes = await this.categoryVoteRepository.find({
      where: {
        user: { id: user.id },
      },
      relations: ['category', 'game'],
    });

    const votedCategories = votes
      .filter((vote) => vote.category.year === year)
      .map((vote) => ({
        id: vote.category.id,
        slug: vote.category.slug,
        name: vote.category.name,
        gameId: vote.game.id,
        gameName: vote.game.name,
        gameCoverUrl: vote.game.image,
      }));

    return votedCategories;
  }

  // Récupérer les 5 finalistes d'une catégorie
  private async getFinalists(categoryId: number) {
    const nominations = await this.categoryNomineeRepository
      .createQueryBuilder('nominee')
      .leftJoinAndSelect('nominee.game', 'game')
      .where('nominee.categoryId = :categoryId', { categoryId })
      .getMany();

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
      .slice(0, 5);
  }

  // Statistiques des votes pour une catégorie
  async getVoteStats(categorySlug: string, year: number) {
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug, year },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const votes = await this.categoryVoteRepository.find({
      where: { category: { id: category.id } },
      relations: ['game'],
    });

    const voteCounts = votes.reduce(
      (acc, vote) => {
        const gameId = vote.game.id;
        if (!acc[gameId]) {
          acc[gameId] = {
            game: {
              id: vote.game.id,
              name: vote.game.name,
              image: vote.game.image,
            },
            count: 0,
          };
        }
        acc[gameId].count++;
        return acc;
      },
      {} as Record<number, { game: any; count: number }>,
    );

    return Object.values(voteCounts).sort((a, b) => b.count - a.count);
  }
}
