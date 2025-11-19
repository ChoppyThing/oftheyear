import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { Repository } from 'typeorm';

describe('GameService', () => {
  let service: GameService;
  let repository: Repository<Game>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getRepositoryToken(Game),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    repository = module.get<Repository<Game>>(getRepositoryToken(Game));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
