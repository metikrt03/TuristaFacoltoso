import type { Utente, Host, Abitazione, Prenotazione, Feedback } from '@/types'

const BASE = import.meta.env.VITE_API_URL || ''

function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  return fetch(`${BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  }).then(async (res) => {
    const text = await res.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(res.ok ? 'Risposta non valida dal server' : (text || res.statusText))
      }
    }
    if (!res.ok) throw new Error(data?.error || text || res.statusText)
    return data
  })
}

// Utenti
export const utentiApi = {
  getAll: () => request<Utente[]>('/api/utenti'),
  getById: (id: number) => request<Utente>(`/api/utenti/${id}`),
  create: (body: Omit<Utente, 'id'>) => request<Utente>('/api/utenti', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Omit<Utente, 'id'>) => request<Utente>(`/api/utenti/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/api/utenti/${id}`, { method: 'DELETE' }),
  topGiorni: () => request<any[]>('/api/utenti/report/top-giorni'),
}

// Host
export const hostApi = {
  getAll: () => request<Host[]>('/api/host'),
  getById: (id: number) => request<Host>(`/api/host/${id}`),
  getByCodice: (codice: string) => request<Host>(`/api/host/codice/${codice}`),
  create: (body: Omit<Host, 'id'>) => request<Host>('/api/host', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Omit<Host, 'id'>) => request<Host>(`/api/host/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/api/host/${id}`, { method: 'DELETE' }),
  topPrenotazioni: () => request<any[]>('/api/host/report/top-prenotazioni'),
  superHost: () => request<any[]>('/api/host/report/super-host'),
}

// Abitazioni
export const abitazioniApi = {
  getAll: () => request<Abitazione[]>('/api/abitazioni'),
  getById: (id: number) => request<Abitazione>(`/api/abitazioni/${id}`),
  getByHostCode: (codice: string) => request<Abitazione[]>(`/api/abitazioni/host/${codice}`),
  create: (body: Omit<Abitazione, 'id'>) => request<Abitazione>('/api/abitazioni', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Omit<Abitazione, 'id'>) => request<Abitazione>(`/api/abitazioni/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/api/abitazioni/${id}`, { method: 'DELETE' }),
  piuGettonata: () => request<any>('/api/abitazioni/report/piu-gettonata'),
  mediaPostiLetto: () => request<number>('/api/abitazioni/report/media-posti-letto'),
}

// Prenotazioni
export const prenotazioniApi = {
  getAll: () => request<Prenotazione[]>('/api/prenotazioni'),
  getById: (id: number) => request<Prenotazione>(`/api/prenotazioni/${id}`),
  getUltimaByUtente: (utenteId: number) => request<Prenotazione>(`/api/prenotazioni/ultima/${utenteId}`),
  create: (body: Omit<Prenotazione, 'id'>) => request<Prenotazione>('/api/prenotazioni', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Omit<Prenotazione, 'id'>) => request<Prenotazione>(`/api/prenotazioni/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/api/prenotazioni/${id}`, { method: 'DELETE' }),
}

// Feedback
export const feedbackApi = {
  getAll: () => request<Feedback[]>('/api/feedback'),
  getById: (id: number) => request<Feedback>(`/api/feedback/${id}`),
  getByPrenotazione: (prenotazioneId: number) => request<Feedback>(`/api/feedback/prenotazione/${prenotazioneId}`),
  create: (body: Omit<Feedback, 'id'>) => request<Feedback>('/api/feedback', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Omit<Feedback, 'id'>) => request<Feedback>(`/api/feedback/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/api/feedback/${id}`, { method: 'DELETE' }),
}
