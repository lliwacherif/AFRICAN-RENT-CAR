import api from './api'

export const excursionsService = {
  getAll: (params = {}) => api.get('/excursions', { params }).then(r => r.data?.data ?? r.data),
  
  getAllAdmin: async () => {
    try {
      const res = await api.get('/excursions/admin');
      const data = res.data?.data ?? res.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (err) {
      console.warn('[excursionsService.getAllAdmin] falling back to getAll:', err.message);
      const publicRes = await api.get('/excursions', { params: { limit: 100 } });
      const pubData = publicRes.data?.data?.excursions ?? publicRes.data?.excursions ?? publicRes.data;
      return Array.isArray(pubData) ? pubData : [];
    }
  },

  getOne: (id) => api.get(`/excursions/${id}`).then(r => r.data?.data ?? r.data),
  
  create: (data) => api.post('/excursions', data).then(r => r.data?.data ?? r.data),
  
  update: (id, data) => api.put(`/excursions/${id}`, data).then(r => r.data?.data ?? r.data),
  
  delete: (id) => api.delete(`/excursions/${id}`).then(r => r.data?.data ?? r.data),
  
  toggleActive: async (id, currentStatus) => {
    const res = await api.put(`/excursions/${id}`, { isActive: !currentStatus });
    return res.data?.data ?? res.data;
  },

  toggleFeatured: async (id, currentFeatured) => {
    const res = await api.put(`/excursions/${id}`, { featured: !currentFeatured });
    return res.data?.data ?? res.data;
  },

  reserve: (id, data) => api.post(`/excursions/${id}/reserve`, data).then(r => r.data?.data ?? r.data),
  
  getReservations: async () => {
    try {
      const res = await api.get('/excursions/reservations');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[excursionsService.getReservations] error:', err.message);
      return [];
    }
  },

  updateReservationStatus: (id, status) => api.patch(`/excursions/reservations/${id}/status`, { status }).then(r => r.data?.data ?? r.data),
}

export default excursionsService
