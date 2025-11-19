import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), forwardRef(() => GameModule)],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
