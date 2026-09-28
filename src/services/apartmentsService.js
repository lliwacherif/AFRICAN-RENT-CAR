import api from './api'

export const apartmentsService = {
  getAll: (params = {}) => api.get('/apartments', { params }).then(r => r.data?.data ?? r.data),
  getAllAdmin: () => api.get('/apartments/admin').then(r => r.data?.data ?? r.data),
  getOne: (id) => api.get(`/apartments/${id}`).then(r => r.data?.data ?? r.data),
  create: (data) => api.post('/apartments', data).then(r => r.data?.data ?? r.data),
  update: (id, data) => api.put(`/apartments/${id}`, data).then(r => r.data?.data ?? r.data),
  delete: (id) => api.delete(`/apartments/${id}`).then(r => r.data?.data ?? r.data),
  toggleActive: (id) => api.patch(`/apartments/${id}/toggle`).then(r => r.data?.data ?? r.data),
  reserve: (id, data) => api.post(`/apartments/${id}/reserve`, data).then(r => r.data?.data ?? r.data),
  getReservations: () => api.get('/apartments/reservations').then(r => r.data?.data ?? r.data),
  updateReservationStatus: (id, status) => api.patch(`/apartments/reservations/${id}/status`, { status }).then(r => r.data?.data ?? r.data),
}

export default apartmentsService
