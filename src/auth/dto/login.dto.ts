import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @ApiProperty({
    example: 'someone@gmail.com',
    description: 'The Email Address',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'Password for login',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
