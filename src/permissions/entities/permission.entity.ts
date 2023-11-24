import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/entities/user.schema';
import { TemplatePerObj } from 'src/utils/classes';

@Schema()
export class PermissionsUserModel extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  userPermissions: TemplatePerObj;
}
export const PermissionUserSchema =
  SchemaFactory.createForClass(PermissionsUserModel);
