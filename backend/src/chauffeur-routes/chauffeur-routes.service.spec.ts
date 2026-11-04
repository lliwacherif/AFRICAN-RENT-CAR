import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ChauffeurRoutesService } from './chauffeur-routes.service';
import { ChauffeurRouteDocument } from './schemas/chauffeur-route.schema';
import { ChauffeurReservationDocument } from './schemas/chauffeur-reservation.schema';
import { ChauffeurDocument } from './schemas/chauffeur.schema';
import { ChauffeurLocationDocument } from './schemas/chauffeur-location.schema';

// Separate service instances share these collections, simulating application
// restarts while preserving the records saved by the database.
function collection(initialRecords: Record<string, any>[] = []) {
  const records = new Map(initialRecords.map(record => [record._id, record]));
  return {
    find: jest.fn(() => ({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(async () => [...records.values()]),
    })),
    findByIdAndDelete: jest.fn((id: string) => ({
      exec: jest.fn(async () => {
        const record = records.get(id) ?? null;
        records.delete(id);
        return record;
      }),
    })),
    countDocuments: jest.fn(async () => records.size),
    insertMany: jest.fn(),
  };
}

describe('ChauffeurRoutesService deletion persistence', () => {
  let routes: ReturnType<typeof collection>;
  let reservations: ReturnType<typeof collection>;
  let chauffeurs: ReturnType<typeof collection>;
  let locations: ReturnType<typeof collection>;

  const createService = () => new ChauffeurRoutesService(
    routes as unknown as Model<ChauffeurRouteDocument>,
    reservations as unknown as Model<ChauffeurReservationDocument>,
    chauffeurs as unknown as Model<ChauffeurDocument>,
    locations as unknown as Model<ChauffeurLocationDocument>,
  );

  beforeEach(() => {
    routes = collection();
    reservations = collection();
    chauffeurs = collection();
    locations = collection();
  });

  it('does not populate empty routes or locations on startup', async () => {
    const service = createService();
    await service.onModuleInit();
    expect(await service.getAll()).toEqual([]);
    expect(await service.getAllLocations()).toEqual([]);
    expect(routes.insertMany).not.toHaveBeenCalled();
    expect(locations.insertMany).not.toHaveBeenCalled();
  });

  it('keeps the last deleted route, reservation and location absent after restarting', async () => {
    routes = collection([{ _id: 'route', from: 'Départ test', to: 'Arrivée test' }]);
    reservations = collection([{ _id: 'booking', routeId: 'route' }]);
    locations = collection([{ _id: 'location', name: 'Lieu test' }]);
    const service = createService();
    expect(await service.delete('route')).toEqual({ success: true });
    expect(await service.deleteReservation('booking')).toMatchObject({ success: true });
    expect(await service.deleteLocation('location')).toMatchObject({ success: true });

    for (let restart = 0; restart < 2; restart++) {
      const restarted = createService();
      await restarted.onModuleInit();
      expect(await restarted.getAll()).toEqual([]);
      expect(await restarted.getReservations()).toEqual([]);
      expect(await restarted.getAllLocations()).toEqual([]);
    }
    expect(routes.insertMany).not.toHaveBeenCalled();
    expect(locations.insertMany).not.toHaveBeenCalled();
  });

  it('deletes only the selected route and preserves the remaining route after startup', async () => {
    routes = collection([
      { _id: 'deleted', from: 'Départ A', to: 'Arrivée A' },
      { _id: 'kept', from: 'Départ B', to: 'Arrivée B' },
    ]);
    await createService().delete('deleted');
    const restarted = createService();
    await restarted.onModuleInit();
    expect((await restarted.getAll()).map(route => route._id)).toEqual(['kept']);
  });

  it.each(['delete', 'deleteReservation', 'deleteLocation'] as const)(
    '%s reports missing records rather than claiming a deletion succeeded',
    async method => {
      await expect(createService()[method]('missing')).rejects.toBeInstanceOf(NotFoundException);
    },
  );
});
