import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import { Picture } from 'src/utils/classes';

class Skill {
  @ApiProperty({ description: 'The name of the skill' })
  name: string;
  @ApiProperty({ description: 'The proficiency level of the skill' })
  proficiencyLevel: number;
}

class EducationDetail {
  @ApiProperty({ description: 'The degree obtained or currently studying for' })
  degree: string;
  @ApiProperty({ description: 'Description of the education details' })
  description: string;
  @ApiProperty({ description: 'The field of study for the education' })
  fieldOfStudy: string;
  @ApiProperty({ description: 'The grade obtained in the education' })
  grade: string;
  @ApiProperty({ description: 'The institute where the education was pursued' })
  institute: string;
  @ApiProperty({ description: 'The start date of the education' })
  startDate: string;
  @ApiProperty({ description: 'The end date of the education' })
  @IsOptional()
  endDate: string;
  @ApiProperty({
    description:
      'Indicates if the candidate is currently studying for this degree',
  })
  currentlyStudying: boolean;
}

class Experience {
  @ApiProperty({ description: 'The title of the experience' })
  title: string;
  @ApiProperty({ description: 'The company name of the experience' })
  companyName: string;
  @ApiProperty({
    description:
      'Indicates if the candidate is currently working in this position',
  })
  currentlyWorking: boolean;
  @ApiProperty({ description: 'Description of the experience' })
  description: string;
  @ApiProperty({
    enum: [
      'fulltime',
      'parttime',
      'selfemployed',
      'freelance',
      'contract',
      'internship',
      'apprenticeship',
      'seasonal',
    ],
    description: 'The type of employment for the experience',
  })
  employmentType: string;
  @ApiProperty({ description: 'The location of the experience' })
  location: string;
  @ApiProperty({
    enum: ['onsite', 'remote', 'hybrid'],
    description: 'The type of job for the experience',
  })
  jobType: string;
  @ApiProperty({ description: 'The start date of the experience' })
  startDate: string;
  @ApiProperty({ description: 'The end date of the experience' })
  endDate: string;
}

export class UpdateCandidate {
  @ApiProperty({
    example: 'john Doe',
    description: 'The name of the candidate',
  })
  @IsOptional()
  name: string;
  @ApiProperty({
    example: 'johnDoe@xyz.abc',
    description: 'The email of the candidate',
  })
  @IsEmail()
  @IsOptional()
  email: string;
  @ApiProperty({ description: 'The phone number of the candidate' })
  @IsOptional()
  phone: string;
  @ApiProperty({ example: 'male', description: 'The gender of the candidate' })
  @IsOptional()
  gender: string;
  @ApiProperty({ description: 'The nationality of the candidate' })
  @IsOptional()
  nationality: string;
  @ApiProperty({ description: 'The LinkedIn profile of the candidate' })
  @IsOptional()
  linkedin: string;
  @ApiProperty({ description: 'The portfolio site of the candidate' })
  @IsOptional()
  portfolioSite: string;
  @ApiProperty({ description: 'The CV URL of the candidate' })
  @IsOptional()
  cvUrl: Picture;
  @ApiProperty({ description: 'The cover letter URL of the candidate' })
  @IsOptional()
  coverLetterUrl: Picture;
  @ApiProperty({ description: 'The avatar URL of the candidate' })
  @IsOptional()
  avatar: Picture;
  @ApiProperty({ type: Skill, description: 'The skills of the candidate' })
  @IsOptional()
  skills: Skill;
  @ApiProperty({
    type: EducationDetail,
    description: 'The education details of the candidate',
  })
  @IsOptional()
  educationDetails: EducationDetail;
  @ApiProperty({
    type: Experience,
    description: 'The experiences of the candidate',
  })
  @IsOptional()
  experiences: Experience;
}

export class Qualifications {
  @ApiProperty({ type: Skill, description: 'The skills of the candidate' })
  @IsOptional()
  skills: Skill;
  @ApiProperty({
    type: EducationDetail,
    description: 'The education details of the candidate',
  })
  @IsOptional()
  educationDetails: EducationDetail;
  @ApiProperty({
    type: Experience,
    description: 'The experiences of the candidate',
  })
  @IsOptional()
  experiences: Experience;
}
