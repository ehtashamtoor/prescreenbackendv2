import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import {
  PermissionUserSchema,
  PermissionsUserModel,
} from './entities/permission.entity';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/entities/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, UserService, CompanyGuard, AdminGuard],
})
export class PermissionModule {}
