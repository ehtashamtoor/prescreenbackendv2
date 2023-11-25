import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CandidateModule } from './candidate/candidate.module';
import { MailingModule } from './mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
// import { join } from 'path';
// import Handlebars from 'handlebars/runtime';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { McqModule } from './mcq/mcq.module';
import { CodingQuestionModule } from './coding-question/coding-question.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TagModule } from './tag/tag.module';
// import { MulterModule } from '@nestjs/platform-express';
import { UploadModule } from './file/file.module';
import { CandidateApplicationModule } from './candidate-application/candidate-application.module';
import { GoogleStrategy } from './auth/google.strategy';
import { ExamModule } from './exam/exam.module';
import { CandidateAssessmentModule } from './candidate-assessment/candidate-assessment.module';
import { GithubStrategy } from './auth/github.strategy';
import { FeedbackModule } from './feedback/feedback.module';
import { FacebookStrategy } from './auth/facebook.strategy';
import { JobModule } from './job/job.module';
import { CandidateFeedbackModule } from './candidate-feedback/candidate-feedback.module';
import { InviteModule } from './examInvite/invite.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { CompanySubscriptionModule } from './company-subscription/company-subscription.module';
import { StripeModule } from './stripe/stripe.module';
import { SubPlanRestrictionsModule } from './sub-plan-restrictions/sub-plan-restrictions.module';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', '/public'),
    //   serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/api',
    // }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/dash' : '/api',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    CompanyModule,
    AuthModule,
    UserModule,
    CandidateModule,
    MailingModule,
    InviteModule,
    // MulterModule.register({
    //   dest: '../uploads', // Destination folder for uploaded files
    // }),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: 'smtps://user@domain.com:pass@smtp.domain.com',
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    // MailerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     transport: {
    //       host: 'premium219.web-hosting.com',
    //       port: 465,
    //       secure: true,
    //       auth: {
    //         user: configService.get<string>('EMAIL_USER'),
    //         pass: configService.get<string>('EMAIL_PASSWORD'),
    //       },
    //     },
    //     defaults: {
    //       from: '"Your Name" <ehtashamtoor_intern@netixsol.com>',
    //     },
    //     template: {
    //       dir: __dirname + '/templates',
    //       adapter: new HandlebarsAdapter(),
    //       options: {
    //         strict: true,
    //       },
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    CloudinaryModule,
    McqModule,
    CodingQuestionModule,
    TagModule,
    UploadModule,
    CandidateApplicationModule,
    ExamModule,
    CandidateAssessmentModule,
    FeedbackModule,
    JobModule,
    CandidateFeedbackModule,
    ContactUsModule,
    SubscriptionPlanModule,
    CompanySubscriptionModule,
    StripeModule.forRoot(process.env.stripeKey!, { apiVersion: '2023-10-16' }),
    SubPlanRestrictionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CloudinaryService,
    GoogleStrategy,
    GithubStrategy,
    FacebookStrategy,
  ],
})
export class AppModule {}
