import {
  Controller,
  Inject,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  ServiceUnavailableException,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { STRIPE_CLIENT } from 'src/file/constant';
import Stripe from 'stripe';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IntentDto, PaymentDto } from 'src/utils/classes';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { CompanyGuard } from 'src/auth/jwt.company.guard';

@ApiTags('Stripe module API')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subPlanService: SubscriptionPlanService,
    private readonly userService: UserService,
    @Inject(STRIPE_CLIENT) private stripe: Stripe,
  ) {}

  @Post('create-payment-intent')
  @UseGuards(AuthGuard(), CompanyGuard)
  async createPaymentIntent(
    @Body() dto: PaymentDto,
    // @Req() req: AuthReq,
  ) {
    // Promise < IntentDto | undefined
    // console.log('create payment route .. userid..', userId);
    try {
      // find the subscription plan
      const subPlanFound = await this.subPlanService.findById(dto.planId);
      let price: number = 0;
      console.log(dto.priceType);
      if (dto.priceType === 'monthly') {
        subPlanFound.pricing.forEach((priceObj) => {
          if (priceObj.billingCycle === 'monthly') {
            price = priceObj.price;
            // console.log(priceObj.price);
            return true;
          }
        });
      } else if (dto.priceType === 'yearly') {
        subPlanFound.pricing.forEach((priceObj) => {
          if (priceObj.billingCycle === 'yearly') {
            price = priceObj.price * 12;
            // console.log(priceObj.price);
            return true;
          }
        });
      } else {
        throw new BadRequestException('Invalid Price type');
      }
      console.log('price to pay', price);
      // const { price } = subPlanFound;

      const paymentIntent = await this.stripeService.createPaymentIntent({
        price,
        // intentId: dto.intentId,
      });

      if (!paymentIntent) {
        throw new ServiceUnavailableException(
          'Failed to create a payment intent',
        );
      }

      // get paymentintentId and client_secret
      const { id, client_secret } = paymentIntent;
      if (client_secret) {
        return { intentId: id, client_secret };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
