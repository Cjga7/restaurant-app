import api from './axios'

export const inventarioApi = {
  // Items globales
  getItems:       (params)     => api.get('/inventario/items', { params }).then(r => r.data),
  getItemById:    (id)         => api.get(`/inventario/items/${id}`).then(r => r.data),
  createItem:     (data)       => api.post('/inventario/items', data).then(r => r.data),
  updateItem:     (id, data)   => api.put(`/inventario/items/${id}`, data).then(r => r.data),
  deleteItem:     (id)         => api.delete(`/inventario/items/${id}`).then(r => r.data),

  // Stock
  getStock:       (params)     => api.get('/inventario/stock', { params }).then(r => r.data),
  updateUmbrales: (id, data)   => api.put(`/inventario/stock/${id}/umbrales`, data).then(r => r.data),
  movimiento:     (data)       => api.post('/inventario/movimientos', data).then(r => r.data),

  // Movimientos
  getMovimientos: (params)     => api.get('/inventario/movimientos', { params }).then(r => r.data),
  transferir: (data) => api.post('/inventario/transferencias', data).then(r => r.data),
}