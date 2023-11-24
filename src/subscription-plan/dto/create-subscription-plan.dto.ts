import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

// export class Allowed {
//   @IsNotEmpty()
//   @IsNumber()
//   @ApiProperty({ example: '5' })
//   general: number;

//   @IsNotEmpty()
//   @IsNumber()
//   @ApiProperty({ example: '0' })
//   private: number;
// }
export class Pricing {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'monthly', description: 'monthly or yearly' })
  billingCycle: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '10' })
  price: number;
}

//   @IsNotEmpty()
//   @IsNumber()
//   @ApiProperty({ example: '0' })
//   private: number;
// }

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    example: 'basic',
    description: 'basic, standard, or premium',
  })
  @IsNotEmpty()
  @IsString()
  planTitle: string;

  @ApiProperty({
    example: 'this is plan description',
    description: 'plan description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: {
      mcqsBank: false,
      codingBank: false,
      examBank: false,
      testsAllowed: 0,
      jobsAllowed: 0,
    },
    description: 'Features allowed in the plan',
  })
  @IsNotEmpty()
  @IsObject()
  featuresAllowed: {
    mcqsBank: boolean;
    codingBank: boolean;
    examBank: boolean;
    testsAllowed: number;
    jobsAllowed: number;
  };

  @ApiProperty({
    isArray: true,
    type: [Pricing],
    example: [
      { billingCycle: 'monthly', price: 10 },
      { billingCycle: 'yearly', price: 100 },
    ],
    description: 'Pricing options',
  })
  @IsNotEmpty()
  @IsArray()
  pricing: Pricing[];

  // @ApiProperty({
  //   example: false,
  //   description: 'Is the subscription plan active or not',
  // })
  @ApiHideProperty()
  isActive: boolean;

  // @ApiProperty({
  //   example: 0,
  //   description: 'Subscription plan duration in months',
  // })
  // @IsNotEmpty()
  // @IsNumber()
  // duration: number;
}
