import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultsController } from './results.controller';
import { Category } from 'src/category/category.entity';
import { CategoryNominee } from 'src/category-nominee/category-nominee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryNominee])],
  controllers: [ResultsController],
})
export class ResultsModule {}
