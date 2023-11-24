import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
export class paymentHistory {
  @ApiProperty({
    description: 'date of last payment',
    example: '2023-11-10T10:32:29.089+00:00',
  })
  @IsNotEmpty()
  date: Date;
  @ApiProperty({
    description: 'amount paid in total',
    example: '300',
  })
  @IsNotEmpty()
  amount: number;
}
export class billingInformation {
  @ApiProperty({
    description: 'card Number',
    example: '',
  })
  @IsNotEmpty()
  cardNumber: string;
  @ApiProperty({
    description: 'Card holder name',
    example: 'ehtasham toor',
  })
  @IsNotEmpty()
  cardHolderName: string;
  //   @ApiProperty({
  //     description: 'expiration Date',
  //     example: '2023-11-10T10:32:29.089+00:00',
  //   })
  //   @IsNotEmpty()
  //   expirationDate: string;
}
export class CreateCompanySubscriptionDto {
  @ApiHideProperty()
  // @ApiProperty({
  //   description: 'company user ref id',
  //   example: '6536da1550d3307ff6e2ca2e',
  // })
  company: string;

  @ApiPropertyOptional({ type: String, description: 'payment intent ID' })
  intentId?: string;
  @ApiProperty({
    description: 'Subscription plan ref id',
    example: '6536da1550d3307ff6e2ca2e',
  })
  @IsNotEmpty()
  SubscriptionPlan: string;

  @ApiHideProperty()
  @IsOptional()
  featuresUsed?: {
    mcqsBank?: boolean;
    codingBank?: boolean;
    examBank?: boolean;
    testsUsed?: number;
    jobsUsed?: number;
  };
  // @ApiProperty({
  //   description: 'subscription plan start date',
  //   example: '2023-11-10T10:32:29.089+00:00',
  // })
  // @ApiHideProperty()
  // @IsNotEmpty()

  // @ApiHideProperty()
  // @IsOptional()
  // featuresUsed: {
  //   examsUsed?: {
  //     general: number;
  //     private: number;
  //   };
  //   testsUsed?: number;
  //   jobsUsed?: number;
  //   mcqUsed?: {
  //     general: number;
  //     private: number;
  //   };
  //   codingQuestionUsed?: {
  //     general: number;
  //     private: number;
  //   };
  // };
  @ApiHideProperty()
  subscriptionStartDate: Date;

  @ApiHideProperty()
  subscriptionEndDate?: Date;

  @ApiProperty({
    description: 'monthly or yearly',
    example: 'monthly',
  })
  planType?: string;

  @ApiHideProperty()
  paymentIntentIds?: string[];
  //   @ApiProperty({
  //     description: 'subscription plan end date',
  //     example: '2023-11-10T10:32:29.089+00:00',
  //   })
  //   @IsNotEmpty()
  //   subscriptionEndDate: Date;
  //   @ApiProperty({
  //     description: 'subscription plan end date',
  //     example: '2023-11-10T10:32:29.089+00:00',
  //     type: [paymentHistory],
  //   })
  // @ApiPropertyOptional({
  //   description: 'subscription plan end date',
  //   type: [paymentHistory],
  // })
  // @IsOptional()
  // paymentHistory: paymentHistory[];
  // @ApiPropertyOptional({
  //   description: 'Billing Information',
  //   type: billingInformation,
  // })
  @ApiHideProperty()
  @IsOptional()
  billingInformation?: billingInformation;

  @ApiHideProperty()
  @IsOptional()
  @IsEnum(['active', 'expired'])
  subscriptionStatus?: string;
}
