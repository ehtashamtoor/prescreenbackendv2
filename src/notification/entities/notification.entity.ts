import { Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Notification {
  id: string;
  notification: string;
  authorId: string;
  conversationID: string;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
