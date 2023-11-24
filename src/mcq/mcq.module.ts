import { Module } from '@nestjs/common';
import { McqService } from './mcq.service';
import { McqController } from './mcq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MCQ, McqSchema } from './entities/mcq.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { SubPlanRestrictionsModule } from 'src/sub-plan-restrictions/sub-plan-restrictions.module';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { CompanyTeamGuard } from 'src/auth/jwt.team.guard';
import { PermissionService } from 'src/permissions/permission.service';
import { PermissionUserSchema, PermissionsUserModel } from 'src/permissions/entities/permission.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MCQ.name,
        schema: McqSchema,
      },
      {
        name: companySubscription.name,
        schema: companySubscriptionSchema,
      },
      {
        name: PermissionsUserModel.name,
        schema: PermissionUserSchema,
      },
    ]),
    AuthModule,
    SubPlanRestrictionsModule,
  ],
  controllers: [McqController],
  providers: [
    McqService,
    SubPlanRestrictionsService,
    CompanyGuard,
    PermissionService,
  ],
})
export class McqModule {}
