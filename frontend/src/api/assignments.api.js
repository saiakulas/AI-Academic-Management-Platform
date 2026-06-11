import api from './axios'

export const assignmentsApi = {
  list:    (params)   => api.get('/assignments', { params }),
  getById: (id)       => api.get(`/assignments/${id}`),
  create:  (data)     => api.post('/assignments', data),
  update:  (id, data) => api.patch(`/assignments/${id}`, data),
  remove:  (id)       => api.delete(`/assignments/${id}`),
  submit:  (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade:   (id, subId, data) => api.patch(`/assignments/${id}/submissions/${subId}/grade`, data),
}
