import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// ── Tickets ───────────────────────────────────────────────────────────────────
export const getTickets = (params = {}) => API.get('/api/tickets/', { params })
export const getTicket  = (id)          => API.get(`/api/tickets/${id}`)
export const createTicket = (data)      => API.post('/api/tickets/', data)
export const updateTicket = (id, data)  => API.put(`/api/tickets/${id}`, data)
export const deleteTicket = (id)        => API.delete(`/api/tickets/${id}`)
export const searchTickets = (q, params = {}) => API.get('/api/tickets/search', { params: { q, ...params } })
export const getStats   = ()            => API.get('/api/tickets/stats')

// ── Comments ──────────────────────────────────────────────────────────────────
export const getComments   = (ticketId)              => API.get(`/api/tickets/${ticketId}/comments`)
export const addComment    = (ticketId, data)        => API.post(`/api/tickets/${ticketId}/comments`, data)
export const deleteComment = (ticketId, commentId)   => API.delete(`/api/tickets/${ticketId}/comments/${commentId}`)

export default API
