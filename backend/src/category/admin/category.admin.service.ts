import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category.entity';
import { User } from '../../user/user.entity';
import {
  AdminCreateCategoryDto,
  AdminListCategoryDto,
  AdminUpdateCategoryDto,
} from './admin-category.dto';
import { CategoryVoteStats, VotePhaseOverview } from '../category.dto';
import { CategoryPhase } from '../category-phase.enum';
import { CategoryNominee } from 'src/category-nominee/category-nominee.entity';
import { FinalVote } from 'src/category-nominee/final-vote.entity';

@Injectable()
export class CategoryAdminService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(CategoryNominee)
    private readonly categoryNomineeRepository: Repository<CategoryNominee>,

    @InjectRepository(FinalVote)
    private readonly finalVoteRepository: Repository<FinalVote>,
  ) {}

  async list(filters: AdminListCategoryDto) {
    const { page = 1, limit = 10, search, year, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.author', 'author')
      .leftJoinAndSelect('category.votes', 'votes')
      .leftJoinAndSelect('category.nominees', 'nominees');

    // Filtres
    if (search) {
      queryBuilder.andWhere('category.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (year) {
      queryBuilder.andWhere('category.year = :year', { year });
    }

    // Tri
    queryBuilder.orderBy(`category.${sortBy}`, sortOrder);

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['author', 'votes', 'nominees'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(
    createDto: AdminCreateCategoryDto,
    author: User,
  ): Promise<Category> {
    // Vérifier l'unicité name + year
    const existing = await this.categoryRepository.findOne({
      where: {
        name: createDto.name,
        year: createDto.year,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Category "${createDto.name}" already exists for year ${createDto.year}`,
      );
    }

    const category = this.categoryRepository.create({
      ...createDto,
      author,
    });

    return this.categoryRepository.save(category);
  }

  async update(
    id: number,
    updateDto: AdminUpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Vérifier l'unicité si name ou year sont modifiés
    if (updateDto.name || updateDto.year) {
      const existing = await this.categoryRepository.findOne({
        where: {
          name: updateDto.name ?? category.name,
          year: updateDto.year ?? category.year,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Category "${updateDto.name ?? category.name}" already exists for year ${updateDto.year ?? category.year}`,
        );
      }
    }

    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async getStats(id: number) {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.votes', 'votes')
      .leftJoinAndSelect('category.nominees', 'nominees')
      .leftJoinAndSelect('nominees.finalVotes', 'finalVotes')
      .where('category.id = :id', { id })
      .getOne();

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return {
      id: category.id,
      name: category.name,
      year: category.year,
      nominationVotesCount: category.votes?.length || 0,
      nomineesCount: category.nominees?.length || 0,
      finalVotesCount:
        category.nominees?.reduce(
          (sum, nominee) => sum + (nominee.finalVotes?.length || 0),
          0,
        ) || 0,
      winner: category.nominees?.find((n) => n.isWinner) || null,
    };
  }

  async getVotePhaseStats(year?: number): Promise<VotePhaseOverview> {
    const currentYear = year || new Date().getFullYear();

    const categories = await this.categoryRepository.find({
      where: {
        year: currentYear,
        phase: CategoryPhase.Vote,
      },
      relations: ['nominees', 'nominees.game'],
    });

    const categoriesStats: CategoryVoteStats[] = await Promise.all(
      categories.map(async (category) => {
        const nominees = await Promise.all(
          category.nominees.map(async (nominee) => {
            // ✅ Compter les votes finaux pour ce nominé
            const voteCount = await this.finalVoteRepository.count({
              where: {
                nominee: { id: nominee.id },
              },
            });

            return {
              id: nominee.id,
              gameId: nominee.game.id, // ✅ Accès via la relation
              gameName: nominee.game.name, // ✅ Accès via la relation
              voteCount,
              percentage: 0,
            };
          }),
        );

        const totalVotes = nominees.reduce((sum, n) => sum + n.voteCount, 0);

        nominees.forEach((nominee) => {
          nominee.percentage =
            totalVotes > 0
              ? Math.round((nominee.voteCount / totalVotes) * 100)
              : 0;
        });

        nominees.sort((a, b) => b.voteCount - a.voteCount);

        return {
          categoryId: category.id,
          categoryName: category.name,
          totalVotes,
          nominees,
        };
      }),
    );

    const totalVotes = categoriesStats.reduce(
      (sum, cat) => sum + cat.totalVotes,
      0,
    );

    return {
      totalCategories: categories.length,
      totalVotes,
      categories: categoriesStats,
    };
  }
}
