import { Module } from '@nestjs/common';
import { CompanySubscriptionService } from './company-subscription.service';
import { CompanySubscriptionController } from './company-subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  companySubscription,
  companySubscriptionSchema,
} from './entities/company-subscription.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/entities/user.schema';
import { MailingService } from 'src/mailing/mailing.service';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from 'src/subscription-plan/entities/subscription-plan.entity';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
    ]),
  ],
  controllers: [CompanySubscriptionController],
  providers: [
    CompanySubscriptionService,
    UserService,
    MailingService,
    SubscriptionPlanService,
  ],
})
export class CompanySubscriptionModule {}
