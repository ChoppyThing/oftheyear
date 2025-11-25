import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { Category } from 'src/category/category.entity';
import { User } from 'src/user/user.entity';
import { Status } from './status.enum';
import { CreateGameDto } from './game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findByYear(year?: number): Promise<Game[]> {
    const query = this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.author', 'author')
      .where('game.status = :status', { status: Status.Validated })
      .orderBy('game.publishAt', 'DESC');

    if (year) {
      query.andWhere('EXTRACT(YEAR FROM game.publishAt) = :year', { year });
    }

    return await query.getMany();
  }

  async findLatest(limit: number = 3): Promise<Game[]> {
    return await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.author', 'author')
      .where('game.status = :status', { status: Status.Validated })
      .orderBy('game.publishAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async proposeGame(createGameDto: CreateGameDto, user: User): Promise<Game> {
    console.log(user);
    const game = this.gameRepository.create({
      ...createGameDto,
      author: user,
      status: Status.Sent,
    });

    return await this.gameRepository.save(game);
  }

  async findOne(id: number): Promise<Game> {
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
   * Récupère les jeux éligibles pour une catégorie donnée
   * Logique:
   * 1. Si la catégorie a des jeux restreints -> retourner UNIQUEMENT ces jeux
   * 2. Si la catégorie n'a pas de jeux restreints -> retourner tous les jeux NON-RESTREINTS (jeux sans allowedCategories ou allowedCategories vide)
   */
  async getGamesForCategory(categoryId: number, year: number): Promise<Game[]> {
    // Récupérer la catégorie avec ses jeux restreints
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['restrictedGames'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Cas 1: La catégorie a des jeux restreints
    if (category.restrictedGames && category.restrictedGames.length > 0) {
      // Retourner uniquement les jeux restreints à cette catégorie qui sont validés et de l'année correcte
      return await this.gameRepository
        .createQueryBuilder('game')
        .innerJoin('game.allowedCategories', 'category')
        .where('category.id = :categoryId', { categoryId })
        .andWhere('game.status = :status', { status: Status.Validated })
        .andWhere('game.year = :year', { year })
        .orderBy('game.name', 'ASC')
        .getMany();
    }

    // Cas 2: La catégorie n'a pas de jeux restreints
    // Retourner tous les jeux qui ne sont restreints à AUCUNE catégorie
    const gamesWithoutRestrictions = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoin('game.allowedCategories', 'category')
      .where('game.status = :status', { status: Status.Validated })
      .andWhere('game.year = :year', { year })
      .andWhere('category.id IS NULL') // Jeux sans catégorie restreinte
      .orderBy('game.name', 'ASC')
      .getMany();

    return gamesWithoutRestrictions;
  }
}
