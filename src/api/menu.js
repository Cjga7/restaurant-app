import api from './axios'

const toFormData = (data) => {
  const fd = new FormData()
  Object.entries(data).forEach(([key, val]) => {
    if (val !== null && val !== undefined) {
      // Convertir booleanos a 1/0 porque FormData no soporta true/false
      fd.append(key, typeof val === 'boolean' ? (val ? 1 : 0) : val)
    }
  })
  return fd
}

export const menuApi = {
  getCategorias:   (params)   => api.get('/menu/categorias', { params }).then(r => r.data),
  createCategoria: (data)     => api.post('/menu/categorias', data).then(r => r.data),
  updateCategoria: (id, data) => api.put(`/menu/categorias/${id}`, data).then(r => r.data),
  deleteCategoria: (id)       => api.delete(`/menu/categorias/${id}`).then(r => r.data),

  getProductos:    (params)   => api.get('/menu/productos', { params }).then(r => r.data),
  createProducto:  (data)     => api.post('/menu/productos', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  updateProducto:  (id, data) => api.post(`/menu/productos/${id}?_method=PUT`, toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  deleteProducto:  (id)       => api.delete(`/menu/productos/${id}`).then(r => r.data),
}