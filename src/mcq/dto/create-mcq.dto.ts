import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class CreateMCQDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Sample MCQ Question',
    description: 'The title of the MCQ',
  })
  title: string;

  // @ApiProperty({
  //   example: 'general',
  //   description: 'general or private',
  // })
  // @IsNotEmpty()
  // @IsString()
  // questionType: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'description',
    description: 'extra information for the MCQ',
  })
  question: string;

  @ApiProperty({
    example: ['Option A', 'Option B', 'Option C', 'Option D'],
    description: 'Array of options for the MCQ',
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(4, { message: 'Four options are required' })
  options: string[];

  @ApiProperty({
    example: 'Option A',
    description: 'The correct option for the MCQ',
  })
  @IsNotEmpty()
  @IsString()
  correctOption: string;

  @ApiProperty({
    example: 'easy',
    description: 'easy, medium or hard',
  })
  @IsNotEmpty()
  @IsString()
  difficultyLevel: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'Language MCQ falls in',
  })
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    example: ['652194b0b14d13342cb3c77e'],
    description: 'ref ids for tags',
  })
  @IsString({ each: true })
  tags: string[];

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  createdBy: string;
}

export class CreateMcqDtoArray {
  @ValidateNested({ each: true })
  @Type(() => CreateMCQDto)
  mcqs: CreateMCQDto[];
}

export class ResponseMCQDto {
  @ApiProperty({ type: [CreateMCQDto] })
  mcqQuestions: CreateMCQDto[];

  @ApiProperty({ type: Number })
  total: number;
}
