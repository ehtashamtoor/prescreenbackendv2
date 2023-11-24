import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    example: 'MERN Stack Developer',
    description: 'Job Title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This is description',
    description: 'Job Description',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'This is task',
    description: 'Job and responsibilities details',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'Fsd Pakistan',
    description: 'Job location',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: '100K',
    description: 'Salary range',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  salaryRange: string;

  @ApiProperty({
    example: 'fullTime',
    description: '[fullTime, partTime, contract]',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  employmentType: string;

  @ApiProperty({
    example: 'onsite',
    description: '[onsite, remote, hybrid]',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  jobType: string;

  // @ApiProperty({
  //   example: 'open',
  //   description: '[open, closed]',
  // })
  // @IsNotEmpty()
  @ApiHideProperty()
  jobStatus: string;

  @ApiProperty({
    description: 'Deadlne of Job application',
  })
  @ApiPropertyOptional()
  @IsNotEmpty()
  applicationDeadline: Date;

  @ApiHideProperty()
  @IsOptional()
  applications: string[];

  @ApiProperty({
    example: '6537592a552324cffd18e864',
    description: 'ref id for the exam',
  })
  @IsNotEmpty()
  @IsString()
  exam: string;

  // @ApiProperty({
  //   example: '6537592a552324cffd18e864',
  //   description: 'ref id of company',
  // })
  @ApiHideProperty()
  createdBy: string;
}
