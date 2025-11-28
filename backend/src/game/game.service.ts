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
   * Logique forceFiltered :
   * - Si forceFiltered = true : UNIQUEMENT les jeux dans restrictedGames
   * - Si forceFiltered = false : TOUS les jeux SAUF ceux filtrés ailleurs (avec forceFiltered=true), MAIS inclure ceux explicitement dans restrictedGames
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

    // Cas 1: forceFiltered = true (catégorie stricte, liste blanche)
    if (category.forceFiltered) {
      if (!category.restrictedGames || category.restrictedGames.length === 0) {
        return [];
      }

      return await this.gameRepository
        .createQueryBuilder('game')
        .innerJoin('game.allowedCategories', 'category')
        .where('category.id = :categoryId', { categoryId })
        .andWhere('game.status = :status', { status: Status.Validated })
        .andWhere('game.year = :year', { year })
        .orderBy('game.name', 'ASC')
        .getMany();
    }

    // Cas 2: forceFiltered = false (catégorie ouverte)
    // Récupérer les jeux filtrés ailleurs (dans catégories avec forceFiltered = true)
    const filteredElsewhereGames = await this.gameRepository
      .createQueryBuilder('game')
      .innerJoin('game.allowedCategories', 'category')
      .where('category.forceFiltered = :forceFiltered', { forceFiltered: true })
      .andWhere('game.status = :status', { status: Status.Validated })
      .andWhere('game.year = :year', { year })
      .getMany();

    const filteredElsewhereIds = filteredElsewhereGames.map(g => g.id);
    const explicitlyAllowedIds = category.restrictedGames?.map(g => g.id) || [];

    // Récupérer tous les jeux de l'année
    const queryBuilder = this.gameRepository
      .createQueryBuilder('game')
      .where('game.status = :status', { status: Status.Validated })
      .andWhere('game.year = :year', { year });

    // Exclure les jeux filtrés ailleurs SAUF ceux explicitement ajoutés ici
    if (filteredElsewhereIds.length > 0) {
      const idsToExclude = filteredElsewhereIds.filter(id => !explicitlyAllowedIds.includes(id));
      if (idsToExclude.length > 0) {
        queryBuilder.andWhere('game.id NOT IN (:...idsToExclude)', { idsToExclude });
      }
    }

    return await queryBuilder.orderBy('game.name', 'ASC').getMany();
  }
}
