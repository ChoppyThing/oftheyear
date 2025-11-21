import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { CategoryUserService } from './category-user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  CategoryProposalFiltersDto,
  CreateCategoryProposalDto,
} from '../category.dto';

@Controller('category/user')
@UseGuards(JwtAuthGuard)
export class CategoryUserController {
  constructor(private readonly categoryUserService: CategoryUserService) {}

  /**
   * POST /category/user
   * Proposer une nouvelle catégorie
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProposal(@Request() req, @Body() dto: CreateCategoryProposalDto) {
    return this.categoryUserService.createProposal(req.user, dto); // ✅ Passe l'objet user complet
  }

  /**
   * GET /category/user/my-proposals
   * Liste des propositions de l'utilisateur
   */
  @Get('my-proposals')
  async getMyProposals(
    @Request() req,
    @Query() filters: CategoryProposalFiltersDto,
  ) {
    return this.categoryUserService.getMyProposals(req.user.id, filters);
  }

  /**
   * GET /category/user/my-proposals/:id
   * Détail d'une proposition
   */
  @Get('my-proposals/:id')
  async getProposalById(@Request() req, @Param('id') id: number) {
    return this.categoryUserService.getProposalById(req.user.id, id);
  }

  /**
   * GET /category/user/stats
   * Statistiques des propositions
   */
  @Get('stats')
  async getMyStats(@Request() req) {
    return this.categoryUserService.getMyStats(req.user.id);
  }

  @Get('has-proposed/:year')
  async hasProposed(@Req() req: any, @Param('year') year: number) {
    const hasProposed = await this.categoryUserService.hasAlreadyProposed(
      req.user.id,
      year,
    );
    return { hasProposed };
  }
}
