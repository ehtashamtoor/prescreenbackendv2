import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.schema';

@Schema({
  timestamps: true,
})
export class MCQ extends Document {
  @Prop({ required: true })
  title: string;

  // @Prop({ enum: ['general', 'private'] })
  // questionType: string;

  @Prop()
  question: string;

  @Prop({
    type: [String],
    required: true,
  })
  options: string[];

  @Prop()
  correctOption: string;

  @Prop()
  language: string;

  @Prop({ enum: ['easy', 'medium', 'hard'] })
  difficultyLevel: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }])
  tags: Tag[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;
}

export const McqSchema = SchemaFactory.createForClass(MCQ);
