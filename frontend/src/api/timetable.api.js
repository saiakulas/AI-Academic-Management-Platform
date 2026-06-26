import api from './axios'

export const timetableApi = {
  /** Create a timetable (admin) */
  create:           (data)      => api.post('/timetable', data),
  /** Active timetable for a class */
  getByClass:       (classId)   => api.get(`/timetable/class/${classId}`),
  /** Full history for a class */
  getHistoryByClass:(classId)   => api.get(`/timetable/class/${classId}/history`),
  /** Teacher's consolidated timetable */
  getByTeacher:     (teacherId) => api.get(`/timetable/teacher/${teacherId}`),
  /** Update a timetable (admin) */
  update:           (id, data)  => api.patch(`/timetable/${id}`, data),
  /** Delete a timetable (admin) */
  remove:           (id)        => api.delete(`/timetable/${id}`),
}
