import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'JavaScript',
    description: 'The name of tag',
  })
  @IsString()
  @IsNotEmpty()
  tagName: string;

  @ApiPropertyOptional({
    description: 'The id of tag',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  _id?: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  user: string;
}
