import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { User } from 'src/user/user.entity';
import { CategoryModule } from 'src/category/category.module';
import { GameAdminController } from './admin/game-admin.controller';
import { GameAdminService } from './admin/game-admin.service';
import { ImageService } from 'src/common/services/image.service';
import { GameUserController } from './user/game-user.controller';
import { GameUserService } from './user/game-user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User]),
    forwardRef(() => CategoryModule),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({ // ✅ async ajouté
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES') as any }, // ✅ as any
      }),
    }),
  ],
  controllers: [GameController, GameAdminController, GameUserController],
  providers: [GameService, GameAdminService, GameUserService, ImageService],
  exports: [GameService, GameUserService],
})
export class GameModule {}
