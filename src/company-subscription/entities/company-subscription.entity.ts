import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { SubscriptionPlan } from 'src/subscription-plan/entities/subscription-plan.entity';
import { User } from 'src/user/entities/user.schema';

@Schema({ timestamps: true })
export class companySubscription extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  company: User;
  // company: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' })
  SubscriptionPlan: SubscriptionPlan;

  // @Prop({
  //   type: Object,
  //   default: {
  //     examsUsed: {
  //       general: 0,
  //       private: 0,
  //     },
  //     testsUsed: 0,
  //     jobsUsed: 0,
  //     mcqUsed: {
  //       general: 0,
  //       private: 0,
  //     },
  //     codingQuestionUsed: {
  //       general: 0,
  //       private: 0,
  //     },
  //   },
  // })
  @Prop({
    type: Object,
    default: {
      mcqsBank: false,
      codingBank: false,
      examBank: false,
      testsAllowed: 0,
      jobsAllowed: 0,
    },
  })
  featuresUsed: {
    mcqsBank: boolean;
    codingBank: boolean;
    examBank: boolean;
    testsUsed: number;
    jobsUsed: number;
  };

  @Prop({ type: Object })
  billingInformation?: {
    cardNumber: string;
    cardHolderName: string;
  };

  @Prop()
  subscriptionStartDate: Date;

  @Prop()
  subscriptionEndDate?: Date;

  @Prop({
    type: String,
    enum: ['active', 'expired'],
  })
  subscriptionStatus: string;

  @Prop({ default: [] })
  paymentIntentIds?: string[];

  // @Prop({ type: [Object] })
  // paymentHistory?: {
  //   date: Date;
  //   amount: number;
  // }[];
}

export const companySubscriptionSchema =
  SchemaFactory.createForClass(companySubscription);
