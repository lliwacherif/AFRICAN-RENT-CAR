import api from './api';

export const chauffeurService = {
  /**
   * Get all active routes
   */
  async getAll(params = {}) {
    const res = await api.get('/chauffeur-routes', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Check if a route exists and has an assigned chauffeur
   * @param {string} from - Departure point
   * @param {string} to - Destination point
   */
  async checkRoute(from, to) {
    if (!from || !to) return null;
    const res = await api.get('/chauffeur-routes/check', {
      params: { from: from.trim(), to: to.trim() }
    });
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    if (data?.found && data?.route) return data.route;
    if (data?._id) return data;
    return null;
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
    const res = await api.get(`/chauffeur-routes/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
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
    const res = await api.post(`/chauffeur-routes/${routeId}/book`, bookingData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Get all chauffeur bookings (Admin & User)
   */
  async getReservations(params = {}) {
    const res = await api.get('/chauffeur-routes/reservations', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Update booking status (Admin)
   */
  async updateReservationStatus(id, newStatus) {
    const res = await api.patch(`/chauffeur-routes/reservations/${id}/status`, { status: newStatus });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Delete booking (Admin)
   */
  async deleteReservation(id) {
    const res = await api.delete(`/chauffeur-routes/reservations/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
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
    const res = await api.get('/chauffeur-routes/admin/locations');
    return res.data?.data !== undefined ? res.data.data : res.data;
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
