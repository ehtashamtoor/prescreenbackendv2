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
    ]),
    AuthModule,
    SubPlanRestrictionsModule,
  ],
  controllers: [McqController],
  providers: [McqService, SubPlanRestrictionsService, CompanyGuard],
})
export class McqModule {}
