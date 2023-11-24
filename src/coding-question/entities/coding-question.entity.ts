import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Company } from 'src/company/entities/company.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Template } from 'src/utils/classes';
import { TestCase } from 'src/utils/types';

@Schema({ timestamps: true })
export class CodingQuestion extends Document {
  @Prop()
  title: string;

  // @Prop({ enum: ['general', 'private'] })
  // questionType: string;

  @Prop()
  description: string;

  @Prop()
  language: string;

  @Prop()
  templates: Template[];

  @Prop()
  functionName: string;

  // @Prop()
  // challengeCode: string;

  // @Prop()
  // solutionCode: string;

  // @Prop()
  // explanation: string;

  @Prop([
    {
      input: String,
      output: String,
    },
  ])
  testCases: TestCase[];

  @Prop({ enum: ['easy', 'medium', 'hard'] })
  difficultyLevel: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }])
  tags: Tag[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
  createdBy: Company;
}
export const CodingQuestionSchema =
  SchemaFactory.createForClass(CodingQuestion);
