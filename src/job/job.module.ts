import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { Job, jobSchema } from './entities/job.entity';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import {
  companySubscription,
  companySubscriptionSchema,
} from 'src/company-subscription/entities/company-subscription.entity';
import { User, UserSchema } from 'src/user/entities/user.schema';
import { UserService } from 'src/user/user.service';
import {
  Candidate,
  CandidateSchema,
} from 'src/candidate/entities/candidate.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import { MailingService } from 'src/mailing/mailing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Job.name,
        schema: jobSchema,
      },
      {
        name: CandidateApplication.name,
        schema: CandidateApplicationSchema,
      },
      { name: companySubscription.name, schema: companySubscriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: Candidate.name, schema: CandidateSchema },
    ]),
    AuthModule,
    PassportModule,
  ],
  controllers: [JobController],
  providers: [
    JobService,
    CandidateApplicationService,
    SubPlanRestrictionsService,
    UserService,
    MailingService,
    CandidateService,
  ],
})
export class JobModule {}
