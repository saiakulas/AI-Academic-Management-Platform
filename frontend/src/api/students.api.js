import api from './axios'

export const studentsApi = {
  list:          (params) => api.get('/students', { params }),
  getById:       (id)     => api.get(`/students/${id}`),
  create:        (data)   => api.post('/students', data),
  update:        (id, data) => api.patch(`/students/${id}`, data),
  remove:        (id)     => api.delete(`/students/${id}`),
  assignParents: (id, parentIds) => api.post(`/students/${id}/parents`, { parentIds }),
}
