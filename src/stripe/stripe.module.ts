import { Module, DynamicModule, Provider } from '@nestjs/common';
import { STRIPE_CLIENT } from 'src/file/constant';
import Stripe from 'stripe';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPlan } from 'src/subscription-plan/entities/subscription-plan.entity';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { User } from 'src/user/entities/user.schema';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlan,
      },
      {
        name: User.name,
        schema: User,
      },
    ]),
  ],
  controllers: [StripeController],
  providers: [StripeService, SubscriptionPlanService, UserService],
})
export class StripeModule {
  static forRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config);

    const stripeProvider: Provider = {
      provide: STRIPE_CLIENT,
      useValue: stripe,
    };
    return {
      module: StripeModule,
      providers: [stripeProvider],
      exports: [stripeProvider],
      global: true,
    };
  }
}
