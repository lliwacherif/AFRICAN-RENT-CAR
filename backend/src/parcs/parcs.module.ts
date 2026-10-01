import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParcsService } from './parcs.service';
import { ParcsController } from './parcs.controller';
import { Parc, ParcSchema } from './schemas/parc.schema';
import { Vehicle, VehicleSchema } from '../vehicles/schemas/vehicle.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Parc.name, schema: ParcSchema }, { name: Vehicle.name, schema: VehicleSchema }])],
  controllers: [ParcsController],
  providers: [ParcsService],
  exports: [ParcsService],
})
export class ParcsModule {}
