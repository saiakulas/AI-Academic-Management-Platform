import api from './axios'

export const profileApi = {
  get:            ()       => api.get('/profile'),
  update:         (data)   => api.patch('/profile', data),
  changePassword: (data)   => api.patch('/profile/change-password', data),
}
