import api from './axios'

export const resultsApi = {
  list:              (params)           => api.get('/results', { params }),
  getById:           (id)               => api.get(`/results/${id}`),
  getStudentResults: (studentId, params)=> api.get(`/results/student/${studentId}`, { params }),
  getClassPerf:      (classId, params)  => api.get(`/results/class/${classId}/performance`, { params }),
  create:            (data)             => api.post('/results', data),
  update:            (id, data)         => api.patch(`/results/${id}`, data),
  togglePublish:     (id, isPublished)  => api.patch(`/results/${id}/publish`, { isPublished }),
  remove:            (id)               => api.delete(`/results/${id}`),
}
