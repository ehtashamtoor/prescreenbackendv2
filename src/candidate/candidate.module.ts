import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { Candidate, CandidateSchema } from './entities/candidate.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/entities/user.schema';
import { PassportModule } from '@nestjs/passport';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Candidate.name,
        schema: CandidateSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: CandidateApplication.name,
        schema: CandidateApplicationSchema,
      },
    ]),
    CloudinaryModule,
    AuthModule,
    UserModule,
    PassportModule,
  ],
  controllers: [CandidateController],
  providers: [CandidateService],
})
export class CandidateModule {}
