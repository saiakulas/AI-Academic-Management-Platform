import api from './axios'

export const teachersApi = {
  list:    (params)     => api.get('/teachers', { params }),
  getById: (id)         => api.get(`/teachers/${id}`),
  create:  (data)       => api.post('/teachers', data),
  update:  (id, data)   => api.patch(`/teachers/${id}`, data),
  remove:  (id)         => api.delete(`/teachers/${id}`),
}
