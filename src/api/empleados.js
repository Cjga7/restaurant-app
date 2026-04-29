import api from './axios'

const toFormData = (data) => {
  const fd = new FormData()
  Object.entries(data).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') {
      fd.append(key, typeof val === 'boolean' ? (val ? 1 : 0) : val)
    }
  })
  return fd
}

export const empleadosApi = {
  getAll:  (params)   => api.get('/empleados', { params }).then(r => r.data),
  getById: (id)       => api.get(`/empleados/${id}`).then(r => r.data),
  create:  (data)     => api.post('/empleados', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  update:  (id, data) => api.post(`/empleados/${id}?_method=PUT`, toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  delete:  (id)       => api.delete(`/empleados/${id}`).then(r => r.data),
}