import { PartialType } from '@nestjs/swagger';
import { CreatePermissionUserDto } from './create-permission.dto';

export class UpdateTagDto extends PartialType(CreatePermissionUserDto) {}
