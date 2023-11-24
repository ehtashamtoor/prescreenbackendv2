import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.schema';
@Schema({ timestamps: true })
export class Candidate extends Document {
  @Prop()
  name: string;
  @Prop()
  email: string;
  @Prop()
  phone: string;
  @Prop()
  gender: string;
  //Rest fields are optional
  @Prop()
  nationality: string;
  @Prop()
  linkedin: string;
  @Prop()
  portfolioSite: string;
  // @Prop({ default: false })
  // isSocialLogin: boolean;
  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  cvUrl: {
    url: string;
    path: string;
    originalname: string;
  };
  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  coverLetterUrl: {
    url: string;
    path: string;
    originalname: string;
  };
  @Prop({
    type: {
      url: String,
      path: String,
      originalname: String,
    },
  })
  avatar: {
    url: string;
    path: string;
    originalname: string;
  };
  @Prop({ type: [{ name: String, proficiencyLevel: Number }] })
  skills: {
    name: string;
    proficiencyLevel: number;
  }[];
  @Prop({
    type: [
      {
        degree: String,
        description: String,
        fieldOfStudy: String,
        grade: String,
        institute: String,
        startDate: String,
        endDate: String,
        currentlyStudying: Boolean,
      },
    ],
  })
  educationDetails: {
    degree: string;
    description: string;
    fieldOfStudy: string;
    grade: string;
    institute: string;
    startDate: string;
    endDate: string;
    currentlyStudying: boolean;
  }[];
  @Prop({
    type: [
      {
        title: String,
        companyName: String,
        currentlyWorking: Boolean,
        description: String,
        employmentType: String,
        endDate: String,
        location: String,
        jobType: String,
        startDate: String,
      },
    ],
  })
  experiences: {
    title: string;
    companyName: string;
    currentlyWorking: boolean;
    description: string;
    employmentType: string;
    location: string;
    jobType: string;
    startDate: string;
    endDate: string;
  }[];
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;
}
export const CandidateSchema = SchemaFactory.createForClass(Candidate);
