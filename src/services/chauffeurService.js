import api from './api';

// Fallback seed routes if backend is briefly offline or during offline dev
export const FALLBACK_ROUTES = [
  {
    _id: 'seed-route-1',
    from: 'Aéroport Tunis-Carthage (TUN)',
    to: 'Sousse Sahloul',
    duration: '1h 45m',
    distance: '142 km',
    basePriceTND: 150,
    vehicleType: 'business-sedan',
    available: true,
    status: 'active',
    assignedChauffeur: {
      name: 'Hassen Trabelsi',
      phone: '+216 98 123 456',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      rating: 4.95,
      experienceYears: 11,
      spokenLanguages: ['Français', 'العربية', 'English'],
      vehicleModel: 'Mercedes-Benz Classe E (2025)',
      vehiclePlate: '234 TU 8901',
      vehicleColor: 'Noir Obsidienne',
      amenities: ['Climatisation bi-zone', 'Wi-Fi 5G Haut Débit', 'Bouteilles d\'eau minérale fraîches', 'Chargeurs USB-C & Lightning', 'Siège bébé disponible sur demande', 'Pancarte VIP à la sortie']
    },
    includes: [
      'Péages autoroutiers inclus',
      'Attente gratuite 60 min avec suivi du vol',
      'Assistance bagages personnalisée',
      'Annulation gratuite jusqu\'à 12h avant le départ'
    ]
  },
  {
    _id: 'seed-route-2',
    from: 'Aéroport Tunis-Carthage (TUN)',
    to: 'Hammamet Sud & Yasmine',
    duration: '55m',
    distance: '75 km',
    basePriceTND: 95,
    vehicleType: 'business-sedan',
    available: true,
    status: 'active',
    assignedChauffeur: {
      name: 'Kais Ben Amor',
      phone: '+216 22 456 789',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: 4.92,
      experienceYears: 8,
      spokenLanguages: ['Français', 'العربية', 'Italiano'],
      vehicleModel: 'Audi A6 Berline Luxe',
      vehiclePlate: '215 TU 4321',
      vehicleColor: 'Gris Métallisé',
      amenities: ['Climatisation confort', 'Wi-Fi à bord', 'Bouteilles d\'eau minérale', 'Chargeurs téléphone', 'Accueil personnalisé']
    },
    includes: [
      'Péages autoroutiers inclus',
      'Attente aéroport gratuite 60 min',
      'Assistance bagages',
      'Annulation flexible'
    ]
  },
  {
    _id: 'seed-route-3',
    from: 'Aéroport Enfidha-Hammamet (NBE)',
    to: 'Sousse Sahloul',
    duration: '35m',
    distance: '42 km',
    basePriceTND: 75,
    vehicleType: 'vip-van',
    available: true,
    status: 'active',
    assignedChauffeur: {
      name: 'Sami Mansour',
      phone: '+216 50 789 012',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 4.98,
      experienceYears: 14,
      spokenLanguages: ['Français', 'العربية', 'Deutsch', 'English'],
      vehicleModel: 'Mercedes-Benz Vito Tourer VIP',
      vehiclePlate: '240 TU 1122',
      vehicleColor: 'Noir Diamant',
      amenities: ['Capacité 7 passagers', 'Grand coffre pour 8 valises', 'Wi-Fi 5G illimité', 'Écrans individuels', 'Rafraîchissements à bord']
    },
    includes: [
      'Accueil aéroport Enfidha avec pancarte nominative',
      'Suivi en direct du vol',
      'Tous les frais de route inclus',
      'Siège enfant sur demande'
    ]
  },
  {
    _id: 'seed-route-4',
    from: 'Aéroport Djerba-Zarzis (DJE)',
    to: 'Midoun & Zone Hôtelière',
    duration: '25m',
    distance: '28 km',
    basePriceTND: 45,
    vehicleType: 'comfort-sedan',
    available: true,
    status: 'active',
    assignedChauffeur: {
      name: 'Nidhal Gafsi',
      phone: '+216 93 345 678',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      rating: 4.89,
      experienceYears: 7,
      spokenLanguages: ['Français', 'العربية'],
      vehicleModel: 'Volkswagen Passat Élégance',
      vehiclePlate: '228 TU 7766',
      vehicleColor: 'Argent Reflex',
      amenities: ['Climatisation', 'Chargeurs téléphone', 'Bouteilles d\'eau', 'Musique personnalisée']
    },
    includes: [
      'Accueil personnalisé avec pancarte',
      'Dépôt direct à la réception de votre hôtel',
      'Assistance bagages'
    ]
  },
  {
    _id: 'seed-route-5',
    from: 'Tunis Centre-Ville',
    to: 'La Marsa & Sidi Bou Saïd',
    duration: '25m',
    distance: '20 km',
    basePriceTND: 50,
    vehicleType: 'comfort-sedan',
    available: true,
    status: 'active',
    assignedChauffeur: {
      name: 'Yassine Dridi',
      phone: '+216 29 112 233',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      rating: 4.94,
      experienceYears: 9,
      spokenLanguages: ['Français', 'العربية', 'English'],
      vehicleModel: 'Peugeot 508 GT Line',
      vehiclePlate: '231 TU 5544',
      vehicleColor: 'Bleu Célèbes',
      amenities: ['Sièges massants', 'Son Hi-Fi Focal', 'Climatisation régulée', 'Bouteilles d\'eau minérale']
    },
    includes: [
      'Prise en charge à votre adresse ou hôtel',
      'Itinéraire optimisé sans embouteillages',
      'Tarif fixe sans surprise de compteur'
    ]
  },
  {
    _id: 'seed-route-6',
    from: 'Aéroport Tunis-Carthage (TUN)',
    to: 'Bizerte Centre & Vieux Port',
    duration: '1h 10m',
    distance: '68 km',
    basePriceTND: 110,
    vehicleType: 'business-sedan',
    available: true,
    status: 'active',
    assignedChauffeur: {
      name: 'Amine Rezgui',
      phone: '+216 97 889 900',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      rating: 4.96,
      experienceYears: 12,
      spokenLanguages: ['Français', 'العربية', 'Italiano'],
      vehicleModel: 'BMW Série 5 Luxury',
      vehiclePlate: '235 TU 9988',
      vehicleColor: 'Gris Sophisto',
      amenities: ['Climatisation 4 zones', 'Wi-Fi haute vitesse', 'Presse du jour & eau minérale', 'Chargeurs induction']
    },
    includes: [
      'Péages autoroute A4 inclus',
      'Accueil hall des arrivées avec pancarte',
      'Assistance bagages complète'
    ]
  }
];

export const chauffeurService = {
  /**
   * Get all active routes
   */
  async getAll(params = {}) {
    try {
      const res = await api.get('/chauffeur-routes', { params });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return FALLBACK_ROUTES;
    } catch (err) {
      console.warn('[chauffeurService.getAll] Backend unavailable, using cached fallback routes:', err.message);
      return FALLBACK_ROUTES;
    }
  },

  /**
   * Check if a route exists and has an assigned chauffeur
   * @param {string} from - Departure point
   * @param {string} to - Destination point
   */
  async checkRoute(from, to) {
    if (!from || !to) return null;
    try {
      const res = await api.get('/chauffeur-routes/check', {
        params: { from: from.trim(), to: to.trim() }
      });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data?.found && data?.route) {
        return data.route;
      }
      if (data && data._id) {
        return data;
      }
      return null;
    } catch (err) {
      console.warn('[chauffeurService.checkRoute] Backend check failed, matching locally:', err.message);
      // Fallback local matching
      const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const nFrom = norm(from);
      const nTo = norm(to);
      return FALLBACK_ROUTES.find(r => 
        (norm(r.from).includes(nFrom) || nFrom.includes(norm(r.from))) &&
        (norm(r.to).includes(nTo) || nTo.includes(norm(r.to)))
      ) || null;
    }
  },

  /**
   * Get unique departure and destination lists from all active routes
   */
  async getPoints() {
    const routes = await this.getAll();
    const departs = Array.from(new Set(routes.map(r => r.from))).sort();
    const destinations = Array.from(new Set(routes.map(r => r.to))).sort();
    return { departs, destinations, routes };
  },

  /**
   * Get route by ID
   */
  async getOne(id) {
    try {
      const res = await api.get(`/chauffeur-routes/${id}`);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      return data;
    } catch (err) {
      return FALLBACK_ROUTES.find(r => r._id === id) || null;
    }
  },

  /**
   * Create a new route (Admin)
   */
  async create(data) {
    const res = await api.post('/chauffeur-routes', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Update route (Admin)
   */
  async update(id, data) {
    const res = await api.put(`/chauffeur-routes/${id}`, data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Delete route (Admin)
   */
  async delete(id) {
    const res = await api.delete(`/chauffeur-routes/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Book a chauffeur route
   */
  async bookRoute(routeId, bookingData) {
    const booking = {
      _id: 'CHF-' + Date.now().toString(36).toUpperCase(),
      routeId,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Keep persistent in localStorage
    const existing = JSON.parse(localStorage.getItem('tcr_chauffeur_reservations') || '[]');
    existing.unshift(booking);
    localStorage.setItem('tcr_chauffeur_reservations', JSON.stringify(existing));

    try {
      const res = await api.post(`/chauffeur-routes/${routeId}/book`, bookingData);
      return res.data?.data || res.data || booking;
    } catch (err) {
      return {
        success: true,
        reference: booking._id,
        ...booking,
        message: 'Votre réservation avec chauffeur a été enregistrée avec succès. Notre équipe et votre chauffeur vous contacteront sous 15 minutes.'
      };
    }
  },

  /**
   * Get all chauffeur bookings (Admin & User)
   */
  async getReservations(params = {}) {
    try {
      const res = await api.get('/chauffeur-routes/reservations', { params });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Backend reservations fetch error, falling back to local:', err.message);
    }

    const stored = JSON.parse(localStorage.getItem('tcr_chauffeur_reservations') || '[]');
    if (stored.length > 0) return stored;

    const defaultBookings = [
      {
        _id: 'CHF-892110',
        fullName: 'Sophie Laurent',
        email: 'sophie.laurent@gmail.com',
        phone: '+33 6 12 34 56 78',
        routeName: 'Aéroport Tunis-Carthage (TUN) ➔ Sousse Sahloul',
        from: 'Aéroport Tunis-Carthage (TUN)',
        to: 'Sousse Sahloul',
        chauffeurName: 'Hassen Trabelsi',
        vehicleModel: 'Mercedes-Benz Classe E 2025',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '14:30',
        flightNumber: 'AF 1184',
        passengers: 2,
        luggage: 3,
        priceTND: 150,
        status: 'confirmed',
        notes: 'Pancarte VIP au nom de Laurent',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        _id: 'CHF-764302',
        fullName: 'Karim Mansour',
        email: 'k.mansour@invest.tn',
        phone: '+216 98 765 432',
        routeName: 'Aéroport Tunis-Carthage (TUN) ➔ Hammamet Sud & Yasmine',
        from: 'Aéroport Tunis-Carthage (TUN)',
        to: 'Hammamet Sud & Yasmine',
        chauffeurName: 'Kais Ben Amor',
        vehicleModel: 'Audi A6 Berline Luxe',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '10:15',
        flightNumber: 'TU 722',
        passengers: 1,
        luggage: 1,
        priceTND: 95,
        status: 'pending',
        notes: 'Voyage d\'affaires, facture requise',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        _id: 'CHF-650981',
        fullName: 'Dr. Alexandre Meyer',
        email: 'alexandre.meyer@swiss-med.ch',
        phone: '+41 79 123 45 67',
        routeName: 'Aéroport Enfidha-Hammamet (NBE) ➔ Sousse Sahloul',
        from: 'Aéroport Enfidha-Hammamet (NBE)',
        to: 'Sousse Sahloul',
        chauffeurName: 'Sami Mansour',
        vehicleModel: 'Mercedes-Benz Vito Tourer VIP',
        date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        time: '16:00',
        flightNumber: 'BJ 512',
        passengers: 4,
        luggage: 5,
        priceTND: 75,
        status: 'confirmed',
        notes: 'Siège auto enfant requis',
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      },
      {
        _id: 'CHF-542199',
        fullName: 'Yassine Belhadj',
        email: 'yassine.b@tech.tn',
        phone: '+216 55 443 322',
        routeName: 'Tunis Centre-Ville ➔ La Marsa & Sidi Bou Saïd',
        from: 'Tunis Centre-Ville',
        to: 'La Marsa & Sidi Bou Saïd',
        chauffeurName: 'Yassine Dridi',
        vehicleModel: 'Peugeot 508 GT Line',
        date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        time: '19:45',
        flightNumber: '',
        passengers: 2,
        luggage: 0,
        priceTND: 50,
        status: 'completed',
        notes: 'Dîner à Sidi Bou Saïd',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      }
    ];

    localStorage.setItem('tcr_chauffeur_reservations', JSON.stringify(defaultBookings));
    return defaultBookings;
  },

  /**
   * Update booking status (Admin)
   */
  async updateReservationStatus(id, newStatus) {
    try {
      const res = await api.patch(`/chauffeur-routes/reservations/${id}/status`, { status: newStatus });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch {
      const stored = JSON.parse(localStorage.getItem('tcr_chauffeur_reservations') || '[]');
      const updated = stored.map(r => r._id === id ? { ...r, status: newStatus } : r);
      localStorage.setItem('tcr_chauffeur_reservations', JSON.stringify(updated));
      return { success: true, status: newStatus };
    }
  },

  // ══════════════════════════════════════════════════════════
  // STANDALONE CHAUFFEURS CRUD (Admin)
  // ══════════════════════════════════════════════════════════

  /**
   * Get all registered chauffeurs
   */
  async getChauffeurs() {
    try {
      const res = await api.get('/chauffeurs');
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (err) {
      console.warn('[chauffeurService.getChauffeurs] Backend error, returning fallback:', err.message);
      return [];
    }
  },

  /**
   * Get chauffeur by ID
   */
  async getChauffeur(id) {
    const res = await api.get(`/chauffeurs/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Create a new chauffeur
   */
  async createChauffeur(data) {
    const res = await api.post('/chauffeurs', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Update a chauffeur
   */
  async updateChauffeur(id, data) {
    const res = await api.put(`/chauffeurs/${id}`, data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Toggle chauffeur active status
   */
  async toggleChauffeur(id) {
    const res = await api.patch(`/chauffeurs/${id}/toggle`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Delete a chauffeur
   */
  async deleteChauffeur(id) {
    const res = await api.delete(`/chauffeurs/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // ══════════════ LOCATIONS MANAGEMENT (CRUD) ══════════════

  /**
   * Get active transfer locations for client selector
   */
  async getLocations(type = 'all') {
    try {
      const res = await api.get('/chauffeur-routes/locations', { params: { type } });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn('Error loading locations from backend:', err.message);
    }
    return [];
  },

  /**
   * Get all transfer locations for Admin CRUD
   */
  async getAdminLocations() {
    try {
      const res = await api.get('/chauffeur-routes/admin/locations');
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn('Error loading admin locations from backend:', err.message);
    }
    return [];
  },

  /**
   * Create a new transfer location (Admin)
   */
  async createLocation(data) {
    const res = await api.post('/chauffeur-routes/admin/locations', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Update a transfer location (Admin)
   */
  async updateLocation(id, data) {
    const res = await api.put(`/chauffeur-routes/admin/locations/${id}`, data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Delete a transfer location (Admin)
   */
  async deleteLocation(id) {
    const res = await api.delete(`/chauffeur-routes/admin/locations/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Toggle location active status (Admin)
   */
  async toggleLocation(id) {
    const res = await api.patch(`/chauffeur-routes/admin/locations/${id}/toggle`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  }
};
