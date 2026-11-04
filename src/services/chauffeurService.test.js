import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { chauffeurService } from './chauffeurService';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.resetAllMocks();
  // Old releases left demo bookings and duplicate bookings in this cache.
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => JSON.stringify([{ _id: 'CHF-892110', fullName: 'Legacy booking' }])),
    setItem: vi.fn(),
  });
});

describe('chauffeur persistence', () => {
  it.each([
    ['routes', 'getAll'],
    ['reservations', 'getReservations'],
    ['locations', 'getAdminLocations'],
  ])('keeps an empty %s list empty on subsequent loads, regardless of old browser data', async (_, method) => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
    api.get.mockResolvedValueOnce({ data: [] });

    expect(await chauffeurService[method]()).toEqual([]);
    expect(await chauffeurService[method]()).toEqual([]);
    expect(localStorage.getItem).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it.each(['getAll', 'getReservations', 'getAdminLocations'])(
    '%s reports failed loads instead of returning sample or cached records',
    async method => {
      const error = new Error('API unavailable');
      api.get.mockRejectedValueOnce(error);
      await expect(chauffeurService[method]()).rejects.toBe(error);
      expect(localStorage.getItem).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['delete', '/chauffeur-routes/record-id'],
    ['deleteReservation', '/chauffeur-routes/reservations/record-id'],
    ['deleteLocation', '/chauffeur-routes/admin/locations/record-id'],
  ])('%s requires a successful server deletion', async (method, endpoint) => {
    const error = new Error('Deletion refused');
    api.delete.mockRejectedValueOnce(error);
    await expect(chauffeurService[method]('record-id')).rejects.toBe(error);
    expect(api.delete).toHaveBeenCalledWith(endpoint);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('does not claim that an unsaved booking or status update succeeded', async () => {
    const error = new Error('Database unavailable');
    api.post.mockRejectedValueOnce(error);
    api.patch.mockRejectedValueOnce(error);

    await expect(chauffeurService.bookRoute('route-id', { fullName: 'Test' })).rejects.toBe(error);
    await expect(chauffeurService.updateReservationStatus('booking-id', 'confirmed')).rejects.toBe(error);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses the saved booking returned by the server without creating a second browser copy', async () => {
    const booking = { _id: 'saved-id', fullName: 'Test', status: 'pending' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: booking } });

    expect(await chauffeurService.bookRoute('route-id', { fullName: 'Test' })).toEqual(booking);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('does not offer a deleted sample route when a lookup fails', async () => {
    api.get.mockRejectedValue(new Error('Route unavailable'));
    await expect(chauffeurService.getOne('seed-route-1')).rejects.toThrow('Route unavailable');
    await expect(chauffeurService.checkRoute('Tunis', 'Sousse')).rejects.toThrow('Route unavailable');
  });
});
