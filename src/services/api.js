import axios from 'axios'
import { normalizeMediaFields } from '../utils/mediaUrl'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tcr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — clear token and redirect to home
api.interceptors.response.use(
  (res) => {
    res.data = normalizeMediaFields(res.data, API_BASE)
    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tcr_token')
      localStorage.removeItem('tcr_user')
    }
    return Promise.reject(error)
  },
)

export default api
