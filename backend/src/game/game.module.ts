import { forwardRef, Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { User } from 'src/user/user.entity';
import { CategoryModule } from 'src/category/category.module';
import { GameAdminController } from './admin/game-admin.controller';
import { GameAdminService } from './admin/game-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User]),
    forwardRef(() => CategoryModule),
  ],
  controllers: [GameController, GameAdminController],
  providers: [GameService, GameAdminService],
  exports: [GameService],
})
export class GameModule {}
