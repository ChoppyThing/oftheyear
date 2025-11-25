import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { User } from 'src/user/user.entity';
import { Category } from 'src/category/category.entity';
import { CategoryModule } from 'src/category/category.module';
import { GameAdminController } from './admin/game-admin.controller';
import { GameAdminService } from './admin/game-admin.service';
import { ImageService } from 'src/common/services/image.service';
import { RevalidationService } from 'src/common/services/revalidation.service';
import { GameUserController } from './user/game-user.controller';
import { GameUserService } from './user/game-user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User, Category]),
    forwardRef(() => CategoryModule),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES') as any },
      }),
    }),
  ],
  controllers: [GameController, GameAdminController, GameUserController],
  providers: [GameService, GameAdminService, GameUserService, ImageService, RevalidationService],
  exports: [GameService, GameUserService],
})
export class GameModule {}
