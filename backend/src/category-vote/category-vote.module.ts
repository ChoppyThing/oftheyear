import { Module } from '@nestjs/common';
import { CategoryVoteController } from './category-vote.controller';
import { CategoryVoteService } from './category-vote.service';

@Module({
  controllers: [CategoryVoteController],
  providers: [CategoryVoteService]
})
export class CategoryVoteModule {}
