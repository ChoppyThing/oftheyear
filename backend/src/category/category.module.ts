import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { GameModule } from 'src/game/game.module';
import { CategoryAdminController } from './admin/category.admin.controller';
import { CategoryAdminService } from './admin/category.admin.service';
import { CategoryVote } from 'src/category-vote/category-vote.entity';
import { CategoryNominee } from 'src/category-nominee/category-nominee.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { FinalVote } from 'src/category-nominee/final-vote.entity';
import { CategoryUserController } from './user/category-user.controller';
import { CategoryUserService } from './user/category-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, CategoryVote, CategoryNominee, FinalVote]),
    forwardRef(() => GameModule),
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [CategoryController, CategoryAdminController, CategoryUserController],
  providers: [CategoryService, CategoryAdminService, CategoryUserService],
  exports: [CategoryService, CategoryAdminService],
})
export class CategoryModule {}
