import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Template } from 'src/utils/classes';

export class TestCase {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '1' })
  input: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '3' })
  output: string;
}

export class CodingQuestionDto {
  @ApiProperty({
    example: 'Sample Title',
    description: 'The title of the coding question.',
  })
  @IsNotEmpty()
  title: string;

  // @ApiProperty({
  //   example: 'general',
  //   description: 'general or private',
  // })
  // @IsNotEmpty()
  // @IsString()
  // questionType: string;

  @ApiProperty({
    example: 'Sample Description',
    description: 'The description of the coding question.',
  })
  description: string;

  @ApiProperty({
    example: 'javascript',
    description: 'The programming language used for the question.',
  })
  @IsOptional()
  language: string;

  @ApiProperty({
    // example: 'function finduser(id){if(id === 2){return user}}',
    description: 'the template for the given langauge.',
    type: [Template],
  })
  @IsOptional()
  templates: Template[];

  @ApiProperty({
    example: 'calculateSum',
    description: 'The name of the function to be implemented.',
  })
  functionName: string;

  // @ApiProperty({
  //   example: 'function calculateSum(a, b)',
  //   description: 'The challenge code for the question.',
  // })
  // challengeCode: string;

  // @ApiProperty({
  //   example: 'function calculateSum(a, b) { return a + b; }',
  //   description: 'The solution code for the question.',
  // })
  // solutionCode: string;

  @ApiProperty({
    example: ['652194b0b14d13342cb3c77e'],
    description: 'ref ids for tags',
  })
  @IsString({ each: true })
  tags: string[];

  // @ApiProperty({
  //   example: 'Here is an explanation of the solution.',
  //   description: 'Explanation of the solution for the question.',
  // })
  // explanation: string;

  @ApiProperty({
    example: [{ input: '1', output: '3' }],
    description: 'Test cases for the question in JSON format.',
  })
  // @IsString({ each: true })
  testCases: TestCase[];

  // @ApiProperty({
  //   example: '1213sjdjfj3t318ui489w234',
  //   description: 'The ref id of the company',
  // })
  @ApiHideProperty()
  @IsOptional()
  createdBy: string;

  @ApiProperty({
    example: 'medium',
    description: 'The difficulty Level of the Question',
  })
  @IsOptional()
  difficultyLevel: string;
}

export class ResponseCodingDto {
  @ApiProperty({ type: [CodingQuestionDto] })
  codingQuestions: CodingQuestionDto[];

  @ApiProperty({ type: Number })
  total: number;
}
