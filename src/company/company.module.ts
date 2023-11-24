import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company, CompanySchema } from './entities/company.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/user/entities/user.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Job, jobSchema } from 'src/job/entities/job.entity';
import { JobService } from 'src/job/job.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      {
        name: CandidateApplication.name,
        schema: CandidateApplicationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Job.name,
        schema: jobSchema,
      },
    ]),
    CloudinaryModule,
    AuthModule,
    UserModule,
    ConfigModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService, ConfigService, UserService, JobService],
})
export class CompanyModule {}
