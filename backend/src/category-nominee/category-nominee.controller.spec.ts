import { Test, TestingModule } from '@nestjs/testing';
import { CategoryNomineeController } from './category-nominee.controller';

describe('CategoryNomineeController', () => {
  let controller: CategoryNomineeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryNomineeController],
    }).compile();

    controller = module.get<CategoryNomineeController>(CategoryNomineeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
