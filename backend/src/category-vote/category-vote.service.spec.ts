import { Test, TestingModule } from '@nestjs/testing';
import { CategoryVoteService } from './category-vote.service';

describe('CategoryVoteService', () => {
  let service: CategoryVoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryVoteService],
    }).compile();

    service = module.get<CategoryVoteService>(CategoryVoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
