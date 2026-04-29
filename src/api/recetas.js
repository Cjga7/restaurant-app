import api from './axios'

export const recetasApi = {
  getByProducto: (productoId)    => api.get(`/productos/${productoId}/recetas`).then(r => r.data),
  sync:          (productoId, items) => api.post(`/productos/${productoId}/recetas`, { items }).then(r => r.data),
}