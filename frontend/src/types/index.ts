export interface Utente {
  id?: number
  nome: string
  cognome: string
  email: string
  indirizzo?: string
}

export interface Host {
  id?: number
  codiceHost: string
  nome: string
  cognome: string
  email: string
  indirizzo?: string
}

export interface Abitazione {
  id?: number
  nome: string
  indirizzo: string
  locali: number
  postiLetto: number
  piano?: number
  prezzo: number
  dataInizio: string
  dataFine: string
  hostId: number
}

export interface Prenotazione {
  id?: number
  dataInizio: string
  dataFine: string
  utenteId: number
  abitazioneId: number
}

export interface Feedback {
  id?: number
  titolo?: string
  testo?: string
  punteggio: number
  prenotazioneId: number
}
