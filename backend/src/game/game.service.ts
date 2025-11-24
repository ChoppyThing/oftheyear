import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { User } from 'src/user/user.entity';
import { Status } from './status.enum';
import { CreateGameDto } from './game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async findByYear(year?: number): Promise<Game[]> {
    const query = this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.author', 'author')
      .where('game.status = :status', { status: Status.Validated })
      .orderBy('game.publishAt', 'DESC');

    if (year) {
      query.andWhere('EXTRACT(YEAR FROM game.publishAt) = :year', { year });
    }

    return await query.getMany();
  }

  async findLatest(limit: number = 3): Promise<Game[]> {
    return await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.author', 'author')
      .where('game.status = :status', { status: Status.Validated })
      .orderBy('game.publishAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async proposeGame(createGameDto: CreateGameDto, user: User): Promise<Game> {
    console.log(user);
    const game = this.gameRepository.create({
      ...createGameDto,
      author: user,
      status: Status.Sent,
    });

    return await this.gameRepository.save(game);
  }

  async findOne(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }
}
