import { Module } from '@nestjs/common';
import { CategoryNomineeController } from './category-nominee.controller';
import { CategoryNomineeService } from './category-nominee.service';

@Module({
  controllers: [CategoryNomineeController],
  providers: [CategoryNomineeService]
})
export class CategoryNomineeModule {}
