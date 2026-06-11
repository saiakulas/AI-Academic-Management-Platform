import api from './axios'

export const attendanceApi = {
  mark:                  (data)            => api.post('/attendance', data),
  update:                (id, data)        => api.patch(`/attendance/${id}`, data),
  getByClass:            (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
  getStudentSummary:     (studentId, params) => api.get(`/attendance/student/${studentId}/summary`, { params }),
  getTodaySummary:       ()                => api.get('/attendance/today-summary'),
}
