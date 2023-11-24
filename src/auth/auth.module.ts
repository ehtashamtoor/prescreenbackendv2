import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserSchema } from '../user/entities/user.schema';
import { UserService } from 'src/user/user.service';
import { CompanyService } from 'src/company/company.service';
import { CompanySchema } from 'src/company/entities/company.entity';
import { CandidateSchema } from 'src/candidate/entities/candidate.entity';
import { CandidateService } from 'src/candidate/candidate.service';
import { MailingService } from 'src/mailing/mailing.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AppService } from 'src/app.service';
import { GoogleStrategy } from './google.strategy';
import { companySubscriptionSchema } from 'src/company-subscription/entities/company-subscription.entity';
import { CompanySubscriptionService } from 'src/company-subscription/company-subscription.service';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { SubscriptionPlanSchema } from 'src/subscription-plan/entities/subscription-plan.entity';
import { jobSchema } from 'src/job/entities/job.entity';
import { CandidateApplicationSchema } from 'src/candidate-application/entities/candidate-application.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('Jwt_secret'),
          signOptions: {
            expiresIn: config.get<string | number>('Jwt_exp'),
          },
        };
      },
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }]),
    MongooseModule.forFeature([{ name: 'Candidate', schema: CandidateSchema }]),
    MongooseModule.forFeature([{ name: 'Job', schema: jobSchema }]),
    MongooseModule.forFeature([
      { name: 'companySubscription', schema: companySubscriptionSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'CandidateApplication', schema: CandidateApplicationSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    UserService,
    CompanyService,
    CandidateService,
    MailingService,
    CloudinaryService,
    AppService,
    CompanySubscriptionService,
    SubscriptionPlanService,
  ],

  exports: [JwtStrategy, PassportModule, GoogleStrategy],
})
export class AuthModule {}
