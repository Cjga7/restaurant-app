import api from './axios'

export const reportesApi = {
  resumen:           (params) => api.get('/reportes/resumen', { params }).then(r => r.data),
  ventasPorDia:      (params) => api.get('/reportes/ventas-por-dia', { params }).then(r => r.data),
  productosTop:      (params) => api.get('/reportes/productos-top', { params }).then(r => r.data),
  ventasPorMetodo:   (params) => api.get('/reportes/ventas-metodo', { params }).then(r => r.data),
  performanceCajeros:(params) => api.get('/reportes/cajeros', { params }).then(r => r.data),
  stockCritico:      (params) => api.get('/reportes/stock-critico', { params }).then(r => r.data),
}