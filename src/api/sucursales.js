import api from './axios'

export const sucursalesApi = {
  getAll:  ()         => api.get('/sucursales').then(r => r.data),
  getById: (id)       => api.get(`/sucursales/${id}`).then(r => r.data),
  create:  (data)     => api.post('/sucursales', data).then(r => r.data),
  update:  (id, data) => api.put(`/sucursales/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/sucursales/${id}`).then(r => r.data),
}