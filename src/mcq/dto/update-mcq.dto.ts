import { PartialType } from '@nestjs/swagger';
import { CreateMCQDto } from './create-mcq.dto';

export class UpdateMcqDto extends PartialType(CreateMCQDto) {}
