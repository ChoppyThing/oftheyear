import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category.entity';
import { CategoryPhase } from '../category-phase.enum';
import { User } from '../../user/user.entity';
import { Role } from '../../user/role.enum';
import {
  CategoryProposalFiltersDto,
  CreateCategoryProposalDto,
} from '../category.dto';

@Injectable()
export class CategoryUserService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Proposer une nouvelle catégorie
   */
  async createProposal(user: User, dto: CreateCategoryProposalDto) {
    // Vérifier si l'utilisateur a déjà proposé une catégorie (sauf s'il est admin)
    const isAdmin = user.roles.includes(Role.Admin);
    if (!isAdmin) {
      const alreadyProposed = await this.hasAlreadyProposed(user.id, dto.year);
      if (alreadyProposed) {
        throw new ForbiddenException(
          'Vous avez déjà proposé une catégorie pour cette année',
        );
      }
    }

    const existing = await this.categoryRepository.findOne({
      where: {
        name: dto.name,
        year: dto.year,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Une catégorie "${dto.name}" existe déjà pour l'année ${dto.year}`,
      );
    }

    const category = this.categoryRepository.create({
      ...dto,
      author: user,
      phase: CategoryPhase.Nomination,
    });

    return this.categoryRepository.save(category);
  }

  /**
   * Récupérer les propositions de l'utilisateur connecté
   */
  async getMyProposals(userId: number, filters: CategoryProposalFiltersDto) {
    const { page = 1, limit = 10, phase, year } = filters;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.author', 'author')
      .where('author.id = :userId', { userId })
      .orderBy('category.createdAt', 'DESC');

    if (phase) {
      queryBuilder.andWhere('category.phase = :phase', { phase });
    }

    if (year) {
      queryBuilder.andWhere('category.year = :year', { year });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer une proposition spécifique
   */
  async getProposalById(userId: number, proposalId: number) {
    const proposal = await this.categoryRepository.findOne({
      where: {
        id: proposalId,
      },
      relations: ['author'],
    });

    if (!proposal) {
      throw new NotFoundException('Proposition non trouvée');
    }

    // Vérifier que c'est bien l'auteur
    if (proposal.author.id !== userId) {
      throw new NotFoundException('Proposition non trouvée');
    }

    return proposal;
  }

  /**
   * Statistiques des propositions
   */
  async getMyStats(userId: number) {
    const proposals = await this.categoryRepository.find({
      where: { author: { id: userId } },
    });

    return {
      total: proposals.length,
      nomination: proposals.filter((p) => p.phase === CategoryPhase.Nomination)
        .length,
      vote: proposals.filter((p) => p.phase === CategoryPhase.Vote).length,
      closed: proposals.filter((p) => p.phase === CategoryPhase.Closed).length,
    };
  }

  async hasAlreadyProposed(userId: number, year: number): Promise<boolean> {
    const count = await this.categoryRepository.count({
      where: {
        author: { id: userId },
        year,
      },
    });
    return count > 0;
  }
}
