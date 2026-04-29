import api from './axios'

export const pedidosApi = {
  getAll:         (params)          => api.get('/pedidos', { params }).then(r => r.data),
  getById:        (id)              => api.get(`/pedidos/${id}`).then(r => r.data),
  create:         (data)            => api.post('/pedidos', data).then(r => r.data),
  update:         (id, data)        => api.put(`/pedidos/${id}`, data).then(r => r.data),
  delete:         (id)              => api.delete(`/pedidos/${id}`).then(r => r.data),
  cambiarEstado:  (id, estado)      => api.patch(`/pedidos/${id}/estado`, { estado }).then(r => r.data),

  addItem:        (id, data)        => api.post(`/pedidos/${id}/items`, data).then(r => r.data),
  updateItem:     (id, itemId, cantidad) => api.put(`/pedidos/${id}/items/${itemId}`, { cantidad }).then(r => r.data),
  deleteItem:     (id, itemId)      => api.delete(`/pedidos/${id}/items/${itemId}`).then(r => r.data),
}