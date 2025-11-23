import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserAdminService } from './admin/user-admin.service';
import { UserAdminController } from './admin/user-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController, UserAdminController],
  providers: [UserService, UserAdminService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
