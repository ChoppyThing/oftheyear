import { Test, TestingModule } from '@nestjs/testing';
import { CategoryNomineeService } from './category-nominee.service';

describe('CategoryNomineeService', () => {
  let service: CategoryNomineeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryNomineeService],
    }).compile();

    service = module.get<CategoryNomineeService>(CategoryNomineeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
