import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UpdateCompanyyDto } from 'src/company/dto/updatecompany.dto';
import { ExamCodingQuestion } from 'src/exam/dto/ExamCodingQuestion.dto';
import { ExamMcqQuestion } from 'src/exam/dto/ExamMcqQuestion.dto';
import { ExamDto } from 'src/exam/dto/exam.dto';
import { CreateTagDto } from 'src/tag/dto/create-tag.dto';

export class QuestionObj {
  @ApiProperty()
  easy: { count: DifficultyCount };
  @ApiProperty()
  medium: { count: DifficultyCount };
  @ApiProperty()
  hard: { count: DifficultyCount };
}

export class examObj {
  @ApiProperty()
  totalTime: number;
  @ApiProperty()
  totalQuestions: number;
}
export class AssessementStatsRefreshResponse {
  @ApiProperty()
  exam: examObj;
  @ApiProperty()
  attempts: number;
  @ApiProperty()
  timeRemaining: number;
}

export class DifficultyCount {
  @ApiProperty()
  count: number;
}

export class Picture {
  @ApiProperty()
  url: string;
  @ApiProperty()
  path: string;
  @ApiProperty()
  originalname: string;
}

export class CandidateObj {
  @ApiProperty({
    example: 'john Doe',
    description: 'The name of the candidate',
  })
  name: string;

  @ApiProperty({
    example: 'Pakistani',
    description: 'nationality of candidate',
  })
  nationality: string;

  @ApiProperty({
    description: 'The portfolio link of the candidate',
  })
  portfolioSite: string;

  @ApiProperty({
    description: 'The linkedin profile link of the candidate',
  })
  linkedin: string;

  @ApiProperty({
    example: 'johnDoe@xyz.abc',
    description: 'The email of the candidate',
  })
  email: string;

  @ApiProperty({
    example: '+923008648940',
    description: 'The phone number of the candidate',
  })
  phone: string;

  @ApiProperty({ example: 'male', description: 'The gender of the candidate' })
  gender: string;

  @ApiProperty({
    example: 'thisispassword',
    description: 'The password of the candidate',
  })
  password: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({
    description: 'Candidate Avatar',
    type: Picture,
  })
  avatar: Picture;

  @ApiProperty({
    description: 'Candidate CvUrl',
    type: Picture,
  })
  cvUrl: Picture;

  @ApiProperty({
    description: 'Candidate CoverLetter',
    type: Picture,
  })
  coverLetterUrl: Picture;
}

export class message {
  @ApiProperty({
    description: 'Message according to success',
  })
  message: string;
}

export class OtpTime {
  @ApiProperty({
    example: 232444,
    description: 'The time remaining',
  })
  otpTime: number;
}

export class OtpTimeMessage {
  @ApiProperty({
    example: 'Please check your email for Otp',
    description: 'Email sent',
  })
  message: string;

  @ApiProperty({
    example: 232444,
    description: 'The time remaining',
  })
  otpTime: number;
}

export class userToSend {
  @ApiProperty({
    description: 'The name of the user',
  })
  name: string;
  @ApiProperty({
    description: 'The email of the user',
  })
  email: string;
  @ApiProperty({
    description: 'The id of the user',
  })
  userId: string;
  @ApiProperty({
    description: 'The user type of the user',
  })
  type: string;
}

export class LoginResponse {
  @ApiProperty({
    description: 'The user who logs in',
  })
  user: userToSend;

  @ApiProperty({
    description: 'The token for the user',
  })
  token: string;
}

export class Template {
  @ApiProperty({
    example: 'javascript',
    description: 'The language',
  })
  templateLanguage: string;

  @ApiProperty({
    example: 'function finduser(id){if(id === 2){return user}}',
    description: 'the template for language',
  })
  template: string;
}

export class paginationDto {
  @IsOptional()
  @ApiPropertyOptional()
  page?: number;

  @IsOptional()
  @ApiPropertyOptional()
  limit?: number;
}

export class jobPaginationDto extends paginationDto {
  @ApiProperty({
    example: 'open',
    description: 'Job status',
  })
  @IsOptional()
  @ApiPropertyOptional()
  jobStatus?: string;
}

export class TagsResponseDto {
  @ApiProperty({ type: [CreateTagDto] })
  allTags: CreateTagDto[];
  @ApiProperty({ type: Number })
  total: number;
}

export class companyPaginationDto extends paginationDto {
  @ApiProperty({
    example: 'Netixsol',
    description: 'Company Title',
  })
  @IsOptional()
  @ApiPropertyOptional()
  companyTitle?: string;
}

export class jobsListingDto extends paginationDto {
  @IsOptional()
  @ApiPropertyOptional()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  datePosted?: string;

  @ApiPropertyOptional()
  @IsOptional()
  jobStatus?: string;
}

export class identifierResponse {
  @ApiProperty({
    description: 'true or false',
  })
  isUserPresent: boolean;
  @ApiProperty({
    description: 'email',
  })
  email: string;
  @ApiProperty({
    description: 'examid',
  })
  examid: string;
  @ApiProperty({
    description: 'jobid',
  })
  job: string;
  @ApiProperty({
    description: 'name',
  })
  name?: string;
  @ApiProperty({
    description: 'phone',
  })
  phone?: string;
  @ApiProperty({
    description: 'gender',
  })
  gender?: string;
}

export class AssessmentMcqObj {
  @ApiProperty({
    example: false,
    description: 'true or false',
  })
  isFinished: boolean;

  @ApiProperty({
    description: 'question returned',
  })
  question: ExamMcqQuestion;

  @ApiProperty({
    example: false,
    description: 'false or true',
  })
  isCodingQuestion: boolean;
}

export class AssessmentCodingObj {
  @ApiProperty({
    example: false,
    description: 'true or false',
  })
  isFinished: boolean;

  @ApiProperty({
    description: 'question returned',
  })
  question: ExamCodingQuestion;

  @ApiProperty({
    example: false,
    description: 'false or true',
  })
  isCodingQuestion: boolean;
}

export class companyResponseDto {
  @ApiProperty({ type: [UpdateCompanyyDto] })
  companies: UpdateCompanyyDto[];
  @ApiProperty({ type: Number })
  total: number;
}

export class CandidateResults {
  @ApiProperty({
    example: 'company',
    description: 'company name',
  })
  companyName: string;

  @ApiProperty({
    example: 'candidate',
    description: 'candidate name',
  })
  candidateName: string;

  @ApiProperty({
    example: 'candidate@gmail.com',
    description: 'candidate email',
  })
  candidateEmail: string;

  @ApiProperty({
    example: 'JAVASCRIPT DEVELOPER',
    description: 'exam title',
  })
  examTitle: string;

  @ApiProperty({
    example: 20,
    description: 'Total marks by candidate',
  })
  Marks: number;

  @ApiProperty({
    description: 'time assessment was created',
  })
  assessmentCreatedAt: string;
}

export class Prop {
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  questionId: string;
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  answer: string;
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  correct: boolean;
}

export class CodingQuestion {
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Question ID',
  })
  questionId: string;
  @ApiProperty({
    description: 'Coding Answer',
  })
  answer: string;
}

export class Marks {
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  index: number;
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  mcqtimeLeft: number;
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  activeMcqs: boolean;
  @ApiProperty({
    // example: '6528d9f3dbec99a939a5a60f',
    // description: 'Candidate ID',
  })
  codingtimeLeft: number;
  @ApiProperty({
    // example: 'true',
    // description: 'Test completion status',
  })
  isFinished: boolean;
  @ApiProperty({
    // example: '2',
    // description: 'Number of test attempts',
  })
  attempts: number;
  @ApiProperty({
    // example: '50',
    // description: 'Obtained points in test',
  })
  points: number;
}

export class Assessment {
  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Candidate ID',
  })
  candidate: string;

  @ApiProperty({
    example: '6528d9f3dbec99a939a5a60f',
    description: 'Exam ID',
  })
  exam: ExamDto;

  @ApiProperty({
    description: 'MCQ Questions with Answers',
    type: [Prop],
  })
  mcqQuestions: Prop[];

  @ApiProperty({
    description: 'List of MCQs',
    type: [String],
    example: ['6528d9f3dbec99a939a5a60f'],
  })
  mcqs: string[];

  @ApiProperty({
    description: 'Coding Questions with Answers',
    type: [CodingQuestion],
  })
  codingQuestions: CodingQuestion[];

  @ApiProperty({
    description: 'List of Coding Questions',
    type: [String],
    example: ['6528d9f3dbec99a939a5a60f'],
  })
  codings: string[];

  @ApiProperty({
    description: 'Assessment Score',
    example: 85,
  })
  score: number;

  @ApiProperty({
    description: 'Assessment Status',
    enum: ['pending', 'completed', 'passed', 'failed'],
    example: 'completed',
  })
  status: string;

  @ApiProperty({
    description: 'Assessment Feedback',
    example: 'Good job!',
  })
  feedback: string;

  @ApiProperty({
    description: 'Test Pointer',
    type: [Marks],
  })
  testPointer: Marks[];
}

export class AssessmentsDto {
  @ApiProperty({ type: [Assessment] })
  applications: Assessment[];
  @ApiProperty({ type: Number })
  total: number;
}

export class FeedbackObject {
  @ApiProperty({ type: String })
  feedbackQuestion: string;
  @ApiProperty({ type: Number })
  rating: number;
  @ApiProperty({ type: String })
  suggestion: string;
}

export class CreateDto {
  @ApiProperty({ type: String, description: 'The job parameter as a string' })
  job: string;
}

export class IdentifierDto {
  @ApiProperty({
    type: String,
    description: 'The identifier for the invitation',
  })
  identifier: string;
}
export class TemplatePerObj {
  // candidate applications
  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  candidate_applications_del: string;

  // assessments

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessments_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessments_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessments_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  assessments_del: string;

  // coding Questions

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  codingQuestions_del: string;

  // mcqs

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  mcqs_del: string;

  // examInvites

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  examInvites_del: string;

  // exams

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  exams_del: string;

  // jobs

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  jobs_del: string;

  // tags

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_read: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_write: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_update: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  tags_del: string;
}
export class TemplatePermissions {
  @ApiProperty({
    type: [TemplatePerObj],
    description: 'The identifier for the invitation',
  })
  allPermissions: TemplatePerObj[];
}

export class Permission {
  read: boolean;
  write: boolean;
  update: boolean;
  del: boolean;
}
export class PermissionsDTO {
  candidate_applications: Permission[];
  assesments: Permission[];
  codingQuestions: Permission[];
  mcqs: Permission[];
  examInvites: Permission[];
  exams: Permission[];
  jobs: Permission[];
  tags: Permission[];
}

export const EnumsCandidate = {
  applyPhase: { status: 'applied', message: '' },
  assessPhase: {
    status: 'Pending Assessment',
    message: 'Please check email for exam link',
  },
  resultPhase: { status: 'view Result', message: '' },
  interviewPhase: {
    status: 'Interview Call',
    message: 'Please check email for interview call',
  },
  hiredPhase: {
    status: 'hired',
    message: 'Contact company for further process',
  },
  rejectPhase: { status: 'rejected', message: '' },
};

export const EnumsCompany = {
  applyPhase: { status: 'accept', message: 'Pending assessment link' },
  assessPhase: {
    status: 'Link sent',
    message: 'Waiting for assessments',
  },
  resultPhase: { status: 'Send mail', message: 'Summon for interview' },
  interviewPhase: {
    status: 'Interviewing',
    message: '',
  },
  hiredPhase: {
    status: 'hired',
    message: '',
  },
  rejectPhase: { status: 'rejected', message: 'rejected candidates' },
};
// TODO: add more team members
export const companyTeamsEnums = {
  member1: 'recruiter',
  member2: 'interviewer',
  member3: 'admin',
};
// TODO: Add more team members
export enum UserRole {
  recruiter = 'recruiter',
  interviewer = 'interviewer',
  admin = 'admin',
}

export class RejectDto {
  @ApiProperty({ description: 'job id ', example: 'string' })
  jobid: string;
  @ApiProperty({ description: 'application id', example: 'string' })
  applicationId: string;
}

export class userAppliesDto {
  @ApiProperty({ description: 'name of user', example: 'toor' })
  name: string;
  // @ApiProperty({ description: 'password of user', example: 'password' })
  @ApiHideProperty()
  @IsOptional()
  password?: string;
  @ApiProperty({
    description: 'user email',
    example: 'ehtashamalitoor50@gmail.com',
  })
  email: string;
  @ApiProperty({ description: 'phone of user', example: '+923128243980' })
  phone: string;
  @ApiHideProperty()
  @IsOptional()
  userType?: string;
  @ApiProperty({ description: 'gender', example: 'male' })
  gender: string;
  @ApiProperty({ description: 'linkedin profile link', example: 'toor' })
  linkedIn: string;
  @ApiProperty({ description: 'The CV URL of the user' })
  @IsOptional()
  cvUrl: Picture;
  @ApiHideProperty()
  @IsOptional()
  isSocialLogin: boolean;
  @ApiHideProperty()
  @IsOptional()
  candidate: string;
}

export class JobAnalyticsResponse {
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  open?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  closed?: number;

  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  onsite?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  remote?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  hybrid?: number;

  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  fullTime?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  partTime?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  selfEmployed?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  freelance?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  contract?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  internship?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  apprenticeship?: number;
  // @ApiProperty({ type: Number })
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  seasonal?: number;
}

export class adminAnalyticsResponse {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Active Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Blocked Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Total Companies': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Active Candidates': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Blocked Candidates': number;
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  'Total Candidates': number;
}

export class PaymentDto {
  @ApiProperty({ description: 'ref id of Subscription plan' })
  planId: string;
  @ApiProperty({ description: 'monthly price or yearly price' })
  priceType: string;
  // @ApiProperty({ description: 'ref id of Payment intent ID' })
  // intentId: string;
  // @ApiProperty({ description: 'currency', example: 'usd' })
  @ApiPropertyOptional({ description: 'currency', example: 'usd' })
  @IsOptional()
  currency?: string;
}

export class IntentDto {
  @ApiProperty({ description: 'Payment intent ID' })
  intentId: string;
  @ApiProperty({ description: 'client_secret for payment' })
  client_secret: string;
}
