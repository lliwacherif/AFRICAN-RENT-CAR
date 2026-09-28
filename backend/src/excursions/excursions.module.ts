import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExcursionsController } from './excursions.controller';
import { ExcursionsService } from './excursions.service';
import { Excursion, ExcursionSchema } from './schemas/excursion.schema';
import {
  ExcursionReservation,
  ExcursionReservationSchema,
} from './schemas/excursion-reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Excursion.name, schema: ExcursionSchema },
      { name: ExcursionReservation.name, schema: ExcursionReservationSchema },
    ]),
  ],
  controllers: [ExcursionsController],
  providers: [ExcursionsService],
  exports: [ExcursionsService],
})
export class ExcursionsModule {}
