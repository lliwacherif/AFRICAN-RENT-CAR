// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import ChauffeursAdmin from './ChauffeursAdmin';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('../../context/CurrencyContext', () => ({ useCurrency: () => ({}) }));
vi.mock('../../components/ChauffeurMap/ChauffeurAdminMapPicker', () => ({ default: () => null }));
vi.mock('../../components/ChauffeurMap/ChauffeurTrailModal', () => ({ default: () => null }));

let container;
let root;
let database;

async function mount() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<ChauffeursAdmin />));
}

async function unmount() {
  await act(async () => root.unmount());
  container.remove();
}

async function selectTab(label) {
  const tab = [...container.querySelectorAll('.admin-tab-btn')].find(b => b.textContent.includes(label));
  expect(tab).toBeDefined();
  await act(async () => tab.click());
}

async function clickDelete(title) {
  const button = container.querySelector(`button[title="${title}"]`);
  expect(button).not.toBeNull();
  await act(async () => button.click());
}

function kpi(label) {
  const card = [...container.querySelectorAll('.dash-stat')].find(el => el.textContent.includes(label));
  return card.querySelector('.dash-stat__value').textContent;
}

beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.resetAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  localStorage.setItem('tcr_chauffeur_reservations', JSON.stringify([{ _id: 'CHF-892110' }]));
  database = {
    routes: [{
      _id: 'route-test', title: 'Ligne test', from: 'Départ test', to: 'Destination test',
      basePriceTND: 150, available: true, popular: true, duration: '1h', distance: '70 km',
      assignedChauffeur: { name: 'Chauffeur test', vehicleModel: 'Véhicule test' },
    }],
    reservations: [{
      _id: 'reservation-test', routeId: 'route-test', routeName: 'Départ test → Destination test',
      from: 'Départ test', to: 'Destination test', chauffeurName: 'Chauffeur test',
      fullName: 'Client persistance', email: 'client@example.test', phone: '12345678',
      date: new Date().toISOString().split('T')[0], time: '14:30', priceTND: 150, status: 'confirmed',
    }],
    locations: [{ _id: 'location-test', name: 'Lieu persistance', category: 'city', type: 'both', isActive: true }],
  };
  api.get.mockImplementation(async url => {
    const lists = {
      '/chauffeur-routes': database.routes,
      '/chauffeur-routes/reservations': database.reservations,
      '/chauffeur-routes/admin/locations': database.locations,
    };
    if (!(url in lists)) throw new Error(`Unexpected GET ${url}`);
    return { data: { success: true, data: structuredClone(lists[url]) } };
  });
  api.delete.mockImplementation(async url => {
    const collections = {
      '/chauffeur-routes/route-test': 'routes',
      '/chauffeur-routes/reservations/reservation-test': 'reservations',
      '/chauffeur-routes/admin/locations/location-test': 'locations',
    };
    const collection = collections[url];
    if (!collection) throw new Error(`Unexpected DELETE ${url}`);
    database[collection] = [];
    return { data: { success: true, data: { success: true } } };
  });
  await mount();
});

afterEach(async () => {
  await unmount();
  vi.restoreAllMocks();
  localStorage.clear();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

describe('chauffeur admin delete and reload', () => {
  it('keeps the final deleted records absent across all five sections after remounting', async () => {
    expect(kpi('Réservations Trajets')).toBe('1');
    expect(kpi('Total Liaisons & Chauffeurs')).toBe('1');

    await selectTab('Demandes de Trajet');
    await clickDelete('Supprimer cette demande de trajet');
    expect(container.textContent).toContain('Aucune demande trouvée.');
    await selectTab('Planning Semaine');
    expect(container.querySelector('[title^="Client persistance"]')).toBeNull();

    await selectTab('Lignes Fixes');
    await clickDelete('Supprimer cette ligne');
    expect(container.textContent).toContain('Aucune ligne ne correspond aux filtres appliqués.');
    await selectTab('Points & Destinations');
    await clickDelete('Supprimer ce lieu');
    expect(container.textContent).toContain('Aucun lieu trouvé correspondant aux filtres.');

    // A fresh component instance fetches all data again, as a page reload does.
    await unmount();
    await mount();
    expect(kpi('Réservations Trajets')).toBe('0');
    expect(kpi('Total Liaisons & Chauffeurs')).toBe('0');
    for (const tab of ['Lignes Fixes', 'Points & Destinations', 'Demandes de Trajet', 'Planning Semaine']) {
      await selectTab(tab);
      expect(container.textContent).not.toContain('Départ test');
      expect(container.textContent).not.toContain('Client persistance');
      expect(container.textContent).not.toContain('Lieu persistance');
    }
    expect(window.alert).not.toHaveBeenCalled();
  });

  it.each([
    ['Lignes Fixes', 'Supprimer cette ligne', 'Départ test'],
    ['Demandes de Trajet', 'Supprimer cette demande de trajet', 'Client persistance'],
    ['Points & Destinations', 'Supprimer ce lieu', 'Lieu persistance'],
  ])('keeps a row visible in %s when the server refuses deletion', async (tab, title, row) => {
    api.delete.mockRejectedValueOnce(new Error('Suppression refusée'));
    await selectTab(tab);
    await clickDelete(title);
    expect(container.textContent).toContain(row);
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Suppression refusée'));
  });

  it('keeps a route active when its status could not be saved', async () => {
    api.put.mockRejectedValueOnce(new Error('Modification refusée'));
    await selectTab('Lignes Fixes');
    const toggle = container.querySelector('[role="switch"]');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    await act(async () => toggle.click());
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Modification refusée'));
  });
});
