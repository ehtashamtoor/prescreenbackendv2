import { Module } from '@nestjs/common';
import { CandidateApplicationService } from './candidate-application.service';
import { CandidateApplicationController } from './candidate-application.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidateApplicationSchema } from './entities/candidate-application.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JobService } from 'src/job/job.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CandidateApplication',
        schema: CandidateApplicationSchema,
      },
      {
        name: Job.name,
        schema: jobSchema,
      },
    ]),
    AuthModule,
    PassportModule,
  ],
  controllers: [CandidateApplicationController],
  providers: [CandidateApplicationService, JobService],
})
export class CandidateApplicationModule {}
