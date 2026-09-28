import { PartialType } from '@nestjs/swagger';
import { CreateExcursionDto } from './create-excursion.dto';

export class UpdateExcursionDto extends PartialType(CreateExcursionDto) {}
