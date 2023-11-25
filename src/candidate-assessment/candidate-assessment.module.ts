import { Module } from '@nestjs/common';
import { CandidateAssessmentService } from './candidate-assessment.service';
import { CandidateAssessmentController } from './candidate-assessment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CandidateAssessment,
  CandidateAssessmentSchema,
} from './entities/candidate-assessment.entity';
import { ExamService } from 'src/exam/exam.service';
import { Exam, ExamSchema } from 'src/exam/entities/exam.entity';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import { McqService } from 'src/mcq/mcq.service';
import {
  CodingQuestion,
  CodingQuestionSchema,
} from 'src/coding-question/entities/coding-question.entity';
import { MCQ, McqSchema } from 'src/mcq/entities/mcq.entity';
import { McqModule } from 'src/mcq/mcq.module';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { JobService } from 'src/job/job.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import { CandidateApplication, CandidateApplicationSchema } from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    AuthModule,
    McqModule,
    MongooseModule.forFeature([
      { name: CandidateAssessment.name, schema: CandidateAssessmentSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: CodingQuestion.name, schema: CodingQuestionSchema },
      { name: MCQ.name, schema: McqSchema },
      { name: Job.name, schema: jobSchema },
      { name:  CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
    ]),
  ],
  controllers: [CandidateAssessmentController],
  providers: [
    CandidateAssessmentService,
    ExamService,
    CodingQuestionsService,
    McqService,
    SubPlanRestrictionsService,
    JobService,
  ],
})
export class CandidateAssessmentModule {}
