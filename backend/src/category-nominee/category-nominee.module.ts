import { Module, forwardRef } from '@nestjs/common';
import { CategoryNomineeController } from './category-nominee.controller';
import { CategoryNomineeService } from './category-nominee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryNominee } from './category-nominee.entity';
import { Category } from 'src/category/category.entity';
import { Game } from 'src/game/game.entity';
import { GameModule } from 'src/game/game.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryNominee, Category, Game]),
    forwardRef(() => GameModule),
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
  controllers: [CategoryNomineeController],
  providers: [CategoryNomineeService],
  exports: [CategoryNomineeService],
})
export class CategoryNomineeModule {}
