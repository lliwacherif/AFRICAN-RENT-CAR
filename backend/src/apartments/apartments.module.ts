import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApartmentsController } from './apartments.controller';
import { ApartmentsService } from './apartments.service';
import { Apartment, ApartmentSchema } from './schemas/apartment.schema';
import {
  ApartmentReservation,
  ApartmentReservationSchema,
} from './schemas/apartment-reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Apartment.name, schema: ApartmentSchema },
      { name: ApartmentReservation.name, schema: ApartmentReservationSchema },
    ]),
  ],
  controllers: [ApartmentsController],
  providers: [ApartmentsService],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
