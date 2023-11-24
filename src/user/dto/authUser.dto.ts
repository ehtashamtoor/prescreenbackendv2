import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthUserDto {
  //   @ApiProperty({ description: 'Name of the user' })
  //   name: string;

  @ApiProperty({ description: 'Name of the user' })
  user: {
    email?: string;
    name: string;
    phone: string;
    _id: string;
  };

  // @ApiProperty({ description: 'Email of the user' })
  // email: string;

  @ApiProperty({ description: 'subscribed plan of company' })
  subscriptionPlan: any;

  @ApiProperty({ example: true, description: 'Verified user or not' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Id of user' })
  _id: string;

  @ApiProperty({ description: 'Last Login info' })
  lastLogin: string;

  //   @ApiProperty({ description: 'Email of the user' })
  //   candidate: string;

  @ApiProperty({ description: 'User login type' })
  @IsNotEmpty()
  isSocialLogin: string;

  // @IsNotEmpty()
  // lastLogin: Date;
}
