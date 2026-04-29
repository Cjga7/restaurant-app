import api from './axios'

export const cajaApi = {
  // Sesiones
  getSesiones:  (params)   => api.get('/caja/sesiones', { params }).then(r => r.data),
  getSesion:    (id)       => api.get(`/caja/sesiones/${id}`).then(r => r.data),
  miSesion:     (sucursalId) => api.get('/caja/mi-sesion', { params: { sucursal_id: sucursalId } }).then(r => r.data),
  abrir:        (data)     => api.post('/caja/sesiones', data).then(r => r.data),
  cerrar:       (id, data) => api.patch(`/caja/sesiones/${id}/cerrar`, data).then(r => r.data),
sesionesActivas: (sucursalId) => api.get('/caja/sesiones-activas', { params: { sucursal_id: sucursalId } }).then(r => r.data),
  // Pagos
  getPagos:     (params)   => api.get('/pagos', { params }).then(r => r.data),
  procesarPago: (data)     => api.post('/pagos', data).then(r => r.data),
}