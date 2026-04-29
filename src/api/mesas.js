import api from './axios'

export const mesasApi = {
  getAll:        (params)       => api.get('/mesas', { params }).then(r => r.data),
  getById:       (id)           => api.get(`/mesas/${id}`).then(r => r.data),
  create:        (data)         => api.post('/mesas', data).then(r => r.data),
  update:        (id, data)     => api.put(`/mesas/${id}`, data).then(r => r.data),
  delete:        (id)           => api.delete(`/mesas/${id}`).then(r => r.data),
  cambiarEstado: (id, estado)   => api.patch(`/mesas/${id}/estado`, { estado }).then(r => r.data),
}