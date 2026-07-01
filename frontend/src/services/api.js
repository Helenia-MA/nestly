import axios from 'axios';

// the base URL for my Flask backend
const BASE_URL = 'http://localhost:5001/api';

// creating axios instance with default configurations
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json'}
})

// attaching JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nestly_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// handling 401 errors - when token is expired
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // token expired or invalid, log out user
            localStorage.removeItem('nestly_token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Authentication APIs
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
}

// categories
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
}

// businesses
export const businessesAPI = {
    getAll: (filters) => api.get('/businesses', { params: filters }),
    getOne: (id) => api.get(`/businesses/${id}`),
    getMyBusinesses: () => api.get('/businesses/my-business'),
    create: (data) => api.post('/businesses', data),
    update: (id, data) => api.put(`/businesses/${id}`, data),
    updateStatus: (id, status) => api.put(`/businesses/${id}/status`, { status }),
    getStats: (id) => api.get(`/businesses/${id}/stats`),
    getBookings: (id, filters) => api.get(`/businesses/${id}/bookings`, { params: filters }),

    // working hours
    setHours: (id, data) => api.post(`/businesses/${id}/hours`, data),
    getHours: (id) => api.get(`/businesses/${id}/hours`),

    // services
    getServices: (id) => api.get(`/businesses/${id}/services`),
    createService: (id, data) => api.post(`/businesses/${id}/services`, data),
    updateService: (id, serviceId, data) => api.put(`/businesses/${id}/services/${serviceId}`, data),
    toggleService: (id, serviceId) => api.patch(`/businesses/${id}/services/${serviceId}/toggle`),
    deleteService: (id, serviceId) => api.delete(`/businesses/${id}/services/${serviceId}`),

    // photos
    uploadPhoto: (id, formData) => api.post(`/businesses/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deletePhoto: (id, photoId) => api.delete(`/businesses/${id}/photos/${photoId}`),
    uploadServicePhoto: (id, serviceId, formData) => api.post(`/businesses/${id}/services/${serviceId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteServicePhoto: (id, serviceId, photoId) => api.delete(`/businesses/${id}/services/${serviceId}/photos/${photoId}`),

    // blocked times
    getBlockedTimes: (id) => api.get(`/businesses/${id}/blocked-times`),
    createBlockedTime: (id, data) => api.post(`/businesses/${id}/blocked-times`, data),
    deleteBlockedTime: (id, blockedTimeId) => api.delete(`/businesses/${id}/blocked-times/${blockedTimeId}`)
}

// Bookings
export const bookingsAPI = {
    getAvailability: (params) => api.get('/bookings/availability', { params }),
    create: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings'),
    cancelByCustomer: (id) => api.patch(`/bookings/${id}/cancel`),
    cancelByBusiness: (id) => api.patch(`/bookings/${id}/cancel-by-business`)
}

// admin
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getBusinesses: (filters) => api.get('/admin/businesses', { params: filters }),
    getUsers: (filters) => api.get('/admin/users', { params: filters }),
    verifyBusiness: (id) => api.patch(`/admin/businesses/${id}/verify`),
    updateBusinessStatus: (id, status) => api.put(`/admin/businesses/${id}/status`, { status }),
    suspendUser: (id) => api.patch(`/admin/users/${id}/suspend`),
    unsuspendUser: (id) => api.patch(`/admin/users/${id}/unsuspend`)
}

export default api
