import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChauffeurRoute, ChauffeurRouteSchema } from './schemas/chauffeur-route.schema';
import { ChauffeurReservation, ChauffeurReservationSchema } from './schemas/chauffeur-reservation.schema';
import { Chauffeur, ChauffeurSchema } from './schemas/chauffeur.schema';
import { ChauffeurLocation, ChauffeurLocationSchema } from './schemas/chauffeur-location.schema';
import { ChauffeurRoutesService } from './chauffeur-routes.service';
import { ChauffeurRoutesController } from './chauffeur-routes.controller';
import { ChauffeursController } from './chauffeurs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChauffeurRoute.name, schema: ChauffeurRouteSchema },
      { name: ChauffeurReservation.name, schema: ChauffeurReservationSchema },
      { name: Chauffeur.name, schema: ChauffeurSchema },
      { name: ChauffeurLocation.name, schema: ChauffeurLocationSchema },
    ]),
  ],
  controllers: [ChauffeurRoutesController, ChauffeursController],
  providers: [ChauffeurRoutesService],
  exports: [ChauffeurRoutesService],
})
export class ChauffeurRoutesModule {}
