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

@Module({
  imports: [
    AuthModule,
    McqModule,
    MongooseModule.forFeature([
      { name: CandidateAssessment.name, schema: CandidateAssessmentSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: CodingQuestion.name, schema: CodingQuestionSchema },
      { name: MCQ.name, schema: McqSchema },
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
  ],
})
export class CandidateAssessmentModule {}
