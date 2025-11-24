import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { User } from 'src/user/user.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { CategoryPhase } from './category-phase.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    // Vérifier si la catégorie existe déjà
    const existing = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      author: user,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      relations: ['author'],
    });

    // Trier manuellement : phase Nomination = sort DESC, phase Vote/Closed = sort ASC
    return categories.sort((a, b) => {
      // Comparer par phase d'abord (Nomination < Vote < Closed)
      const phaseOrder = { nomination: 0, vote: 1, closed: 2 };
      const phaseA = phaseOrder[a.phase] ?? 999;
      const phaseB = phaseOrder[b.phase] ?? 999;
      
      if (phaseA !== phaseB) {
        return phaseA - phaseB;
      }

      // Ensuite trier par sort selon la phase
      if (a.phase === CategoryPhase.Nomination) {
        return b.sort - a.sort; // DESC pour Nomination
      } else {
        return a.sort - b.sort; // ASC pour Vote et Closed
      }
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  /**
   * Category front page
   */
  /**
   * Récupérer toutes les catégories validées
   */
  async findValidated(year?: number): Promise<Category[]> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.author', 'author')
      .where('category.phase = :phase', { phase: CategoryPhase.Vote })
      .orderBy('category.name', 'ASC');

    if (year) {
      queryBuilder.andWhere('category.year = :year', { year });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Récupérer les catégories avec le nombre de jeux
   */
  async findNominatedWithGamesCount(year?: number): Promise<any[]> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.author', 'author')
      .leftJoin('category.nominees', 'nominees')
      .addSelect('COUNT(DISTINCT nominees.id)', 'gamesCount')
      .where('category.phase = :phase', { phase: CategoryPhase.Nomination })
      .groupBy('category.id')
      .addGroupBy('author.id')
      .orderBy('category.name', 'ASC');

    if (year) {
      queryBuilder.andWhere('category.year = :year', { year });
    }

    const categories = await queryBuilder.getRawAndEntities();

    return categories.entities.map((category, index) => ({
      ...category,
      gamesCount: parseInt(categories.raw[index].gamesCount) || 0,
    }));
  }
}
