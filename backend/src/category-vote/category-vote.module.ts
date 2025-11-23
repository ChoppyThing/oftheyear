import { Module } from '@nestjs/common';
import { CategoryVoteController } from './category-vote.controller';
import { CategoryVoteService } from './category-vote.service';
import { CategoryNominee } from 'src/category-nominee/category-nominee.entity';
import { Category } from 'src/category/category.entity';
import { Game } from 'src/game/game.entity';
import { CategoryVote } from './category-vote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([CategoryNominee, Category, Game, CategoryVote]),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES') as any,
          },
        }),
      }),
      UserModule,
    ],
  controllers: [CategoryVoteController],
  providers: [CategoryVoteService]
})
export class CategoryVoteModule {}
