import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from 'src/auth/public.decorator';
import { Category } from 'src/category/category.entity';
import { CategoryNominee } from 'src/category-nominee/category-nominee.entity';

interface ResultItem {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  sort: number;
  year: number;
  winner: {
    gameId: number;
    gameName: string;
    gameImage?: string;
    finalVoteCount: number;
  } | null;
}

@Controller('results')
@Public()
export class ResultsController {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(CategoryNominee)
    private readonly categoryNomineeRepository: Repository<CategoryNominee>,
  ) {}

  @Get()
  async getResults(@Query('year') year?: string, @Query('locale') locale?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();

    const categories = await this.categoryRepository.find({
      where: { year: yearNum },
      relations: ['nominees', 'nominees.game'],
      order: { sort: 'ASC' },
    });

    const results: ResultItem[] = categories.map((category) => {
      const nominees = category.nominees || [];

      // Prefer explicit winner flag
      let winnerNominee = nominees.find((n) => n.isWinner);

      // Otherwise pick the nominee with highest finalVoteCount
      if (!winnerNominee && nominees.length > 0) {
        winnerNominee = nominees.slice().sort((a, b) => (b.finalVoteCount || 0) - (a.finalVoteCount || 0))[0];
      }

      const winner = winnerNominee
        ? {
            gameId: winnerNominee.game.id,
            gameName: winnerNominee.game.name,
            gameImage: winnerNominee.game.image,
            finalVoteCount: winnerNominee.finalVoteCount || 0,
          }
        : null;

      // Prefer localized title if available
      let localizedName = category.name;
      try {
        const t = (category as any).translations;
        if (locale && t && typeof t === 'object' && t[locale] && t[locale].title) {
          localizedName = t[locale].title;
        }
      } catch (e) {
        // ignore
      }

      return {
        categoryId: category.id,
        categoryName: localizedName,
        categorySlug: category.slug,
        sort: category.sort || 0,
        year: category.year,
        winner,
      } as ResultItem;
    });

    return results;
  }
}
