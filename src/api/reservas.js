import api from './axios'

export const reservasApi = {
  getAll:        (params)     => api.get('/reservas', { params }).then(r => r.data),
  getById:       (id)         => api.get(`/reservas/${id}`).then(r => r.data),
  create:        (data)       => api.post('/reservas', data).then(r => r.data),
  update:        (id, data)   => api.put(`/reservas/${id}`, data).then(r => r.data),
  delete:        (id)         => api.delete(`/reservas/${id}`).then(r => r.data),
  cambiarEstado: (id, estado) => api.patch(`/reservas/${id}/estado`, { estado }).then(r => r.data),
  clienteLlego: (id) => api.post(`/reservas/${id}/cliente-llego`).then(r => r.data),
}