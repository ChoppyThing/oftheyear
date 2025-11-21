import { Test, TestingModule } from '@nestjs/testing';
import { CategoryVoteController } from './category-vote.controller';

describe('CategoryVoteController', () => {
  let controller: CategoryVoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryVoteController],
    }).compile();

    controller = module.get<CategoryVoteController>(CategoryVoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
