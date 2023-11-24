import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from './entities/subscription-plan.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
