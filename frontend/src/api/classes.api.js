import api from './axios'

export const classesApi = {
  list:                (params)             => api.get('/classes', { params }),
  getById:             (id)                 => api.get(`/classes/${id}`),
  getStudents:         (id, params)         => api.get(`/classes/${id}/students`, { params }),
  create:              (data)               => api.post('/classes', data),
  update:              (id, data)           => api.patch(`/classes/${id}`, data),
  remove:              (id)                 => api.delete(`/classes/${id}`),
  assignSubjectTeacher:(id, data)           => api.post(`/classes/${id}/subjects`, data),
}
