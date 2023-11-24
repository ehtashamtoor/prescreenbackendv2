import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { TemplatePerObj, UserRole } from 'src/utils/classes';

export class CreatePermissionUserDto {
  @ApiHideProperty()
  @IsOptional()
  user?: string;

  @ApiProperty({
    type: TemplatePerObj,
    description: 'The permissions of the user',
  })
  @IsObject()
  userPermissions: TemplatePerObj;

  // below info is needed to create a user model

  @ApiProperty({
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  @IsString()
  role: string;
}
