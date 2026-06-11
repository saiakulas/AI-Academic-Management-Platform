import api from './axios'

export const subjectsApi = {
  list:    (params)   => api.get('/subjects', { params }),
  getById: (id)       => api.get(`/subjects/${id}`),
  create:  (data)     => api.post('/subjects', data),
  update:  (id, data) => api.patch(`/subjects/${id}`, data),
  remove:  (id)       => api.delete(`/subjects/${id}`),
}
