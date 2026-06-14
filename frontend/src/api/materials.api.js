import api from './axios'

export const materialsApi = {
  list:     (params)       => api.get('/materials', { params }),
  getById:  (id)           => api.get(`/materials/${id}`),
  upload:   (formData)     => api.post('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:   (id, data)     => api.patch(`/materials/${id}`, data),
  remove:   (id)           => api.delete(`/materials/${id}`),
  download: (id)           => api.post(`/materials/${id}/download`),
}
