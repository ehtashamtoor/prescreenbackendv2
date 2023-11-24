import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CandidateAssessment } from 'src/candidate-assessment/entities/candidate-assessment.entity';
import { Job } from 'src/job/entities/job.entity';
import { User } from 'src/user/entities/user.schema';
import { EnumsCandidate, EnumsCompany } from 'src/utils/classes';

@Schema({ timestamps: true })
export class CandidateApplication extends Document {
  @Prop({
    type: {
      status: {
        type: String,
        enum: [
          EnumsCandidate.applyPhase.status,
          EnumsCandidate.assessPhase.status,
          EnumsCandidate.resultPhase.status,
          EnumsCandidate.interviewPhase.status,
          EnumsCandidate.hiredPhase.status,
          EnumsCandidate.rejectPhase.status,
        ],
      },
      message: {
        type: String,
        enum: [
          EnumsCandidate.applyPhase.message,
          EnumsCandidate.assessPhase.message,
          EnumsCandidate.resultPhase.message,
          EnumsCandidate.interviewPhase.message,
          EnumsCandidate.hiredPhase.message,
          EnumsCandidate.rejectPhase.message,
        ],
      },
    },
  })
  statusByCandidate: { status: string; message: string };

  @Prop({
    type: {
      status: {
        type: String,
        enum: [
          EnumsCompany.applyPhase.status,
          EnumsCompany.assessPhase.status,
          EnumsCompany.resultPhase.status,
          EnumsCompany.interviewPhase.status,
          EnumsCompany.hiredPhase.status,
          EnumsCompany.rejectPhase.status,
        ],
      },
      message: {
        type: String,
        enum: [
          EnumsCompany.applyPhase.message,
          EnumsCompany.assessPhase.message,
          EnumsCompany.resultPhase.message,
          EnumsCompany.interviewPhase.message,
          EnumsCompany.hiredPhase.message,
          EnumsCompany.rejectPhase.message,
        ],
      },
    },
  })
  statusByCompany: { status: string; message: string };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  candidate: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
  job: Job;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CandidateAssessment' })
  candidate_assessment: CandidateAssessment;
}

export const CandidateApplicationSchema =
  SchemaFactory.createForClass(CandidateApplication);
