import api from './axios'

export const usersApi = {
  getAll:    (params)   => api.get('/users', { params }).then(r => r.data),
  getById:   (id)       => api.get(`/users/${id}`).then(r => r.data),
  create:    (data)     => api.post('/users', data).then(r => r.data),
  update:    (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
  delete:    (id)       => api.delete(`/users/${id}`).then(r => r.data),
  getRoles:  ()         => api.get('/roles').then(r => r.data),
}