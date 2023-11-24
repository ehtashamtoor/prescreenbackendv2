import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { CandidateApplication } from 'src/candidate-application/entities/candidate-application.entity';
import { Exam } from 'src/exam/entities/exam.entity';
import { User } from 'src/user/entities/user.schema';

@Schema({ timestamps: true })
export class Job {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  content: string;

  @Prop()
  location: string;

  @Prop()
  salaryRange: string;

  @Prop({
    type: String,
    enum: [
      'fullTime',
      'partTime',
      'selfEmployed',
      'freelance',
      'contract',
      'internship',
      'apprenticeship',
      'seasonal',
    ],
  })
  employmentType: string;

  @Prop({
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
  })
  jobType: string;

  @Prop({
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  })
  jobStatus: string;

  @Prop()
  applicationDeadline: Date;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CandidateApplication' }])
  applications: CandidateApplication[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' })
  exam: Exam;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;
}
export const jobSchema = SchemaFactory.createForClass(Job);
