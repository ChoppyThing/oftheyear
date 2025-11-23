import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ResultsModule } from './results/results.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { GameModule } from './game/game.module';
import { Game } from './game/game.entity';
import { CategoryModule } from './category/category.module';
import { Category } from './category/category.entity';
import { CategoryVoteModule } from './category-vote/category-vote.module';
import { CategoryNomineeModule } from './category-nominee/category-nominee.module';
import { CategoryVote } from './category-vote/category-vote.entity';
import { CategoryNominee } from './category-nominee/category-nominee.entity';
import { FinalVote } from './category-nominee/final-vote.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, Game, Category, CategoryVote, CategoryNominee, FinalVote],
        synchronize: true,
        //synchronize: configService.get('NODE_ENV') !== 'production',
        //logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    GameModule,
    CategoryModule,
    CategoryVoteModule,
    CategoryNomineeModule,
    ResultsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
