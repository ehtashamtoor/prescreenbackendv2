import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ExamInvite, ExamInviteSchema } from './entities/invite.entity';
import { MailingService } from 'src/mailing/mailing.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { User, UserSchema } from 'src/user/entities/user.schema';
import { UserService } from 'src/user/user.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { JobService } from 'src/job/job.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ExamInvite.name, schema: ExamInviteSchema },
      { name: Job.name, schema: jobSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: User.name, schema: UserSchema },
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: Candidate.name, schema: CandidateSchema },
    ]),
  ],
  controllers: [InviteController],
  providers: [
    InviteService,
    MailingService,
    CandidateApplicationService,
    UserService,
    SubPlanRestrictionsService,
    JobService,
  ],
})
export class InviteModule {}
