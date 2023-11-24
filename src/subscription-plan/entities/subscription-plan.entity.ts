import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class SubscriptionPlan extends Document {
  @Prop({ unique: true })
  planTitle: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isActive: boolean;

  // @Prop()
  // duration: number;

  @Prop({
    type: {
      mcqsBank: Boolean,
      codingBank: Boolean,
      examBank: Boolean,
      testsAllowed: Number,
      jobsAllowed: Number,
    },
  })
  featuresAllowed: {
    mcqsBank: boolean;
    codingBank: boolean;
    examBank: boolean;
    testsAllowed: number;
    jobsAllowed: number;
  };

  @Prop([
    {
      billingCycle: { type: String, enum: ['monthly', 'yearly'] },
      price: Number,
    },
  ])
  pricing: { billingCycle: string; price: number }[];

  // @Prop({ type: Object })
  // examsAllowed: {
  //   general: number;
  //   private: number;
  // };

  // @Prop()
  // testsAllowed: number;

  // @Prop({ type: Object })
  // mcqAllowed: {
  //   general: number;
  //   private: number;
  // };

  // @Prop({ type: Object })
  // codingQuestionAllowed: {
  //   general: number;
  //   private: number;
  // };
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);

// planTitle
// planDescription
// featuresAllowed
// ------mcqsBank: allowed / not
// ------codingBank: allowed / not
// ------examBank: allowed / not
// monthly price
// yearly price
