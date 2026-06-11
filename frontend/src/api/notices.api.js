import api from './axios'

export const noticesApi = {
  list:    (params)   => api.get('/notices', { params }),
  getById: (id)       => api.get(`/notices/${id}`),
  create:  (data)     => api.post('/notices', data),
  update:  (id, data) => api.patch(`/notices/${id}`, data),
  remove:  (id)       => api.delete(`/notices/${id}`),
  pin:     (id, isPinned) => api.patch(`/notices/${id}/pin`, { isPinned }),
}
