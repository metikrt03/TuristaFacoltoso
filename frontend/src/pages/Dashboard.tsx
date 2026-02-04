import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ErrorMessage from '@/components/ErrorMessage'
import SuccessMessage from '@/components/SuccessMessage'
import DashboardHeader from '@/components/DashboardHeader'
import { 
  Calendar, Building2, Users, MessageSquare, 
  TrendingUp, TrendingDown, ArrowRight,
  Copy, ExternalLink, Mail, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react'
import { prenotazioniApi, abitazioniApi, utentiApi, feedbackApi, hostApi } from '@/services/api'
import type { Prenotazione, Abitazione, Utente, Feedback, Host } from '@/types'

const emptyEditForm = { dataInizio: '', dataFine: '', utenteId: '', abitazioneId: '' }
const emptyEditFormAbitazione = {
  nome: '', indirizzo: '', locali: '', postiLetto: '', piano: '', prezzo: '', dataInizio: '', dataFine: '', hostId: '',
}

const ALL_FILTER = '__all__'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    prenotazioni: 0,
    abitazioni: 0,
    utenti: 0,
    feedbackMedio: 0,
  })
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([])
  const [abitazioni, setAbitazioni] = useState<Abitazione[]>([])
  const [utenti, setUtenti] = useState<Utente[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [dettaglioPrenotazione, setDettaglioPrenotazione] = useState<Prenotazione | null>(null)
  const [editingPrenotazione, setEditingPrenotazione] = useState<Prenotazione | null>(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [editingAbitazione, setEditingAbitazione] = useState<Abitazione | null>(null)
  const [editFormAbitazione, setEditFormAbitazione] = useState(emptyEditFormAbitazione)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [feedbackScoreFilter, setFeedbackScoreFilter] = useState(ALL_FILTER)
  const [feedbackUserFilter, setFeedbackUserFilter] = useState(ALL_FILTER)
  const [prenotazioniUtenteFilter, setPrenotazioniUtenteFilter] = useState(ALL_FILTER)
  const [prenotazioniAbitazioneFilter, setPrenotazioniAbitazioneFilter] = useState(ALL_FILTER)
  const [abitazioniHostFilter, setAbitazioniHostFilter] = useState(ALL_FILTER)

  useEffect(() => {
    setPagePrenotazioni(1)
    setPageFeedback(1)
    setPageAbitazioni(1)
  }, [searchQuery, feedbackScoreFilter, feedbackUserFilter, prenotazioniUtenteFilter, prenotazioniAbitazioneFilter, abitazioniHostFilter])

  const load = () => {
    setError(null)
    return Promise.all([
      prenotazioniApi.getAll(),
      abitazioniApi.getAll(),
      utentiApi.getAll(),
      feedbackApi.getAll(),
      hostApi.getAll(),
    ])
      .then(([pren, ab, ut, fb, hostList]) => {
        setPrenotazioni(pren)
        setAbitazioni(ab)
        setUtenti(ut)
        setFeedback(fb)
        setHosts(hostList)
        const avg = fb.length > 0 ? fb.reduce((s, f) => s + f.punteggio, 0) / fb.length : 0
        setStats({
          prenotazioni: pren.length,
          abitazioni: ab.length,
          utenti: ut.length,
          feedbackMedio: Math.round(avg * 10) / 10,
        })
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [])

  const validateEdit = () => {
    const d1 = new Date(editForm.dataInizio)
    const d2 = new Date(editForm.dataFine)
    if (d2 < d1) {
      setError('La data fine deve essere successiva alla data inizio.')
      return false
    }
    if (editForm.abitazioneId) {
      const abitazione = abitazioni.find((a) => a.id === Number(editForm.abitazioneId))
      if (abitazione?.dataInizio && abitazione?.dataFine) {
        const dispInizio = new Date(abitazione.dataInizio)
        const dispFine = new Date(abitazione.dataFine)
        if (d1 < dispInizio || d2 > dispFine) {
          setError(
            `Le date devono essere nel periodo di disponibilità (dal ${abitazione.dataInizio} al ${abitazione.dataFine}).`
          )
          return false
        }
      }
    }
    return true
  }

  const saveEdit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!validateEdit() || !editingPrenotazione?.id) return
    const payload = {
      dataInizio: editForm.dataInizio,
      dataFine: editForm.dataFine,
      utenteId: Number(editForm.utenteId),
      abitazioneId: Number(editForm.abitazioneId),
    }
    prenotazioniApi.update(editingPrenotazione.id, payload)
      .then(() => {
        setEditingPrenotazione(null)
        setEditForm(emptyEditForm)
        setSuccess('Prenotazione aggiornata con successo.')
        load()
      })
      .catch((e) => setError(e.message))
  }

  const startEdit = (p: Prenotazione) => {
    setEditingPrenotazione(p)
    setEditForm({
      dataInizio: p.dataInizio,
      dataFine: p.dataFine,
      utenteId: String(p.utenteId),
      abitazioneId: String(p.abitazioneId),
    })
    setError(null)
    setSuccess(null)
  }

  const closeEditDialog = () => {
    setEditingPrenotazione(null)
    setEditForm(emptyEditForm)
    setError(null)
  }

  const validateEditAbitazione = () => {
    if (!editFormAbitazione.nome?.trim()) { setError('Il nome è obbligatorio.'); return false }
    if (!editFormAbitazione.indirizzo?.trim()) { setError('L\'indirizzo è obbligatorio.'); return false }
    const locali = Number(editFormAbitazione.locali)
    if (!Number.isInteger(locali) || locali < 1) { setError('Locali deve essere un numero intero ≥ 1.'); return false }
    const posti = Number(editFormAbitazione.postiLetto)
    if (!Number.isInteger(posti) || posti < 1) { setError('Posti letto deve essere un numero intero ≥ 1.'); return false }
    const prezzo = Number(editFormAbitazione.prezzo)
    if (Number.isNaN(prezzo) || prezzo < 0) { setError('Il prezzo deve essere ≥ 0.'); return false }
    if (!editFormAbitazione.dataInizio) { setError('La data inizio è obbligatoria.'); return false }
    if (!editFormAbitazione.dataFine) { setError('La data fine è obbligatoria.'); return false }
    if (new Date(editFormAbitazione.dataFine) < new Date(editFormAbitazione.dataInizio)) {
      setError('La data fine deve essere successiva alla data inizio.')
      return false
    }
    if (!editFormAbitazione.hostId) { setError('Selezionare un host.'); return false }
    return true
  }

  const saveEditAbitazione = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!validateEditAbitazione() || !editingAbitazione?.id) return
    const payload = {
      nome: editFormAbitazione.nome,
      indirizzo: editFormAbitazione.indirizzo,
      locali: Number(editFormAbitazione.locali),
      postiLetto: Number(editFormAbitazione.postiLetto),
      piano: editFormAbitazione.piano ? Number(editFormAbitazione.piano) : undefined,
      prezzo: Number(editFormAbitazione.prezzo),
      dataInizio: editFormAbitazione.dataInizio,
      dataFine: editFormAbitazione.dataFine,
      hostId: Number(editFormAbitazione.hostId),
    }
    abitazioniApi.update(editingAbitazione.id, payload)
      .then(() => {
        setEditingAbitazione(null)
        setEditFormAbitazione(emptyEditFormAbitazione)
        setSuccess('Abitazione aggiornata con successo.')
        load()
      })
      .catch((e) => setError(e.message))
  }

  const startEditAbitazione = (a: Abitazione) => {
    setEditingAbitazione(a)
    setEditFormAbitazione({
      nome: a.nome,
      indirizzo: a.indirizzo,
      locali: String(a.locali),
      postiLetto: String(a.postiLetto),
      piano: a.piano != null ? String(a.piano) : '',
      prezzo: String(a.prezzo),
      dataInizio: a.dataInizio,
      dataFine: a.dataFine,
      hostId: String(a.hostId),
    })
    setError(null)
    setSuccess(null)
  }

  const closeEditAbitazioneDialog = () => {
    setEditingAbitazione(null)
    setEditFormAbitazione(emptyEditFormAbitazione)
    setError(null)
  }

  const getUtente = (id: number) => utenti.find(u => u.id === id)
  const getAbitazione = (id: number) => abitazioni.find(a => a.id === id)

  const PER_PAGE = 6
  const [pagePrenotazioni, setPagePrenotazioni] = useState(1)
  const [pageFeedback, setPageFeedback] = useState(1)
  const [pageAbitazioni, setPageAbitazioni] = useState(1)

  const q = searchQuery.trim().toLowerCase()

  const filteredPrenotazioni = prenotazioni.filter((p) => {
    if (prenotazioniUtenteFilter !== ALL_FILTER && String(p.utenteId) !== prenotazioniUtenteFilter) return false
    if (prenotazioniAbitazioneFilter !== ALL_FILTER && String(p.abitazioneId) !== prenotazioniAbitazioneFilter) return false
    const utente = getUtente(p.utenteId)
    const ab = getAbitazione(p.abitazioneId)
    const hay = `${utente?.nome ?? ''} ${utente?.cognome ?? ''} ${ab?.nome ?? ''} ${p.id}`.toLowerCase()
    return q === '' || hay.includes(q)
  })

  const allPrenotazioniSorted = [...filteredPrenotazioni].sort((a, b) => new Date(b.dataInizio).getTime() - new Date(a.dataInizio).getTime())
  const totalPagesPrenotazioni = Math.max(1, Math.ceil(allPrenotazioniSorted.length / PER_PAGE))
  const currentPagePrenotazioni = Math.min(Math.max(1, pagePrenotazioni), totalPagesPrenotazioni)
  const paginatedPrenotazioni = allPrenotazioniSorted.slice(
    (currentPagePrenotazioni - 1) * PER_PAGE,
    currentPagePrenotazioni * PER_PAGE
  )

  const filteredFeedback = feedback.filter((f) => {
    if (feedbackScoreFilter !== ALL_FILTER && Number(feedbackScoreFilter) !== f.punteggio) return false
    const pren = prenotazioni.find((p) => p.id === f.prenotazioneId)
    if (feedbackUserFilter !== ALL_FILTER && (!pren || String(pren.utenteId) !== feedbackUserFilter)) return false
    const utente = pren ? getUtente(pren.utenteId) : undefined
    const abit = pren ? getAbitazione(pren.abitazioneId) : undefined
    const hay = `${utente?.nome ?? ''} ${utente?.cognome ?? ''} ${f.titolo ?? ''} ${f.testo ?? ''} ${abit?.nome ?? ''}`.toLowerCase()
    return q === '' || hay.includes(q)
  })
  const allFeedbackSorted = [...filteredFeedback].reverse()
  const totalPagesFeedback = Math.max(1, Math.ceil(allFeedbackSorted.length / PER_PAGE))
  const currentPageFeedback = Math.min(Math.max(1, pageFeedback), totalPagesFeedback)
  const paginatedFeedback = allFeedbackSorted.slice(
    (currentPageFeedback - 1) * PER_PAGE,
    currentPageFeedback * PER_PAGE
  )

  const filteredAbitazioni = abitazioni.filter((a) => {
    if (abitazioniHostFilter !== ALL_FILTER && String(a.hostId) !== abitazioniHostFilter) return false
    const hay = `${a.nome} ${a.indirizzo}`.toLowerCase()
    return q === '' || hay.includes(q)
  })
  const totalPagesAbitazioni = Math.max(1, Math.ceil(filteredAbitazioni.length / PER_PAGE))
  const currentPageAbitazioni = Math.min(Math.max(1, pageAbitazioni), totalPagesAbitazioni)
  const paginatedAbitazioni = filteredAbitazioni.slice(
    (currentPageAbitazioni - 1) * PER_PAGE,
    currentPageAbitazioni * PER_PAGE
  )

  const recentFeedback = [...feedback].slice(-3).reverse()

  return (
    <div className="flex gap-8 w-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        <DashboardHeader title="Dashboard" subtitle="Bentornato! Ecco un riepilogo della tua attività." onSearch={setSearchQuery} />
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {/* Quick Stats */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Statistiche rapide</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Prenotazioni</p>
                    <p className="text-2xl font-bold mt-1">
                      {loading ? '—' : stats.prenotazioni.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#2563eb]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Abitazioni</p>
                    <p className="text-2xl font-bold mt-1">
                      {loading ? '—' : stats.abitazioni}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#2563eb]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Utenti</p>
                    <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                      {loading ? '—' : stats.utenti}
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#2563eb]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rating medio</p>
                    <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                      {loading ? '—' : `${stats.feedbackMedio}/5`}
                      <TrendingDown className="h-4 w-4 text-red-400 opacity-70" />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="prenotazioni" className="w-full">
          <TabsList className="bg-muted/50 border-b border-transparent rounded-none h-12 p-0 gap-0">
            <TabsTrigger 
              value="prenotazioni" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2563eb] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6"
            >
              Prenotazioni
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2563eb] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6"
            >
              Feedback
            </TabsTrigger>
            <TabsTrigger 
              value="abitazioni" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2563eb] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6"
            >
              Abitazioni
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prenotazioni" className="mt-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Select value={prenotazioniUtenteFilter} onValueChange={setPrenotazioniUtenteFilter}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Utente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER}>Tutti utenti</SelectItem>
                    {utenti.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.nome} {u.cognome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={prenotazioniAbitazioneFilter} onValueChange={setPrenotazioniAbitazioneFilter}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Abitazione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER}>Tutte abitazioni</SelectItem>
                    {abitazioni.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => { setPrenotazioniUtenteFilter(ALL_FILTER); setPrenotazioniAbitazioneFilter(ALL_FILTER); setPagePrenotazioni(1) }}>
                  Reset filtri
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                  <p className="text-muted-foreground col-span-full">Caricamento...</p>
                ) : allPrenotazioniSorted.length === 0 ? (
                  <p className="text-muted-foreground col-span-full">Nessuna prenotazione.</p>
                ) : (
                  paginatedPrenotazioni.map((p) => {
                  const utente = getUtente(p.utenteId)
                  const ab = getAbitazione(p.abitazioneId)
                  return (
                    <Card key={p.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {utente ? `${utente.nome} ${utente.cognome}` : `Utente #${p.utenteId}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Abitazione:</span> {ab?.nome || `#${p.abitazioneId}`}</p>
                        <p><span className="text-muted-foreground">Date:</span> {formatDate(p.dataInizio)} → {formatDate(p.dataFine)}</p>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1" 
                            onClick={() => setDettaglioPrenotazione(p)}
                          >
                            Dettagli <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEdit(p)}
                          >
                            Modifica
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
              </div>
              {!loading && allPrenotazioniSorted.length > 0 && totalPagesPrenotazioni > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Pagina {currentPagePrenotazioni} di {totalPagesPrenotazioni} · {allPrenotazioniSorted.length} prenotazioni
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagePrenotazioni((prev) => Math.max(1, prev - 1))}
                      disabled={currentPagePrenotazioni <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" /> Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagePrenotazioni((prev) => Math.min(totalPagesPrenotazioni, prev + 1))}
                      disabled={currentPagePrenotazioni >= totalPagesPrenotazioni}
                    >
                      Successiva <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Select value={feedbackScoreFilter} onValueChange={setFeedbackScoreFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Punteggio" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER}>Tutti punteggi</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={feedbackUserFilter} onValueChange={setFeedbackUserFilter}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Utente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER}>Tutti utenti</SelectItem>
                    {utenti.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.nome} {u.cognome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => { setFeedbackScoreFilter(ALL_FILTER); setFeedbackUserFilter(ALL_FILTER); setPageFeedback(1) }}>
                  Reset filtri
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                  <p className="text-muted-foreground col-span-full">Caricamento...</p>
                ) : allFeedbackSorted.length === 0 ? (
                  <p className="text-muted-foreground col-span-full">Nessun feedback.</p>
                ) : (
                  paginatedFeedback.map((f) => {
                    const pren = prenotazioni.find((p) => p.id === f.prenotazioneId)
                    const ut = pren ? getUtente(pren.utenteId) : undefined
                    return (
                      <Card key={f.id} className="shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            {f.titolo || 'Feedback'}
                            <span className="text-accent-foreground text-sm">★ {f.punteggio}/5</span>
                          </CardTitle>
                          {ut && <p className="text-sm text-muted-foreground mt-1">di {ut.nome} {ut.cognome}</p>}
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          {f.testo ? (f.testo.slice(0, 80) + (f.testo.length > 80 ? '...' : '')) : '—'}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
              {!loading && allFeedbackSorted.length > 0 && totalPagesFeedback > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Pagina {currentPageFeedback} di {totalPagesFeedback} · {allFeedbackSorted.length} feedback
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageFeedback((prev) => Math.max(1, prev - 1))}
                      disabled={currentPageFeedback <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" /> Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageFeedback((prev) => Math.min(totalPagesFeedback, prev + 1))}
                      disabled={currentPageFeedback >= totalPagesFeedback}
                    >
                      Successiva <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="abitazioni" className="mt-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Select value={abitazioniHostFilter} onValueChange={setAbitazioniHostFilter}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Host" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER}>Tutti host</SelectItem>
                    {hosts.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>{h.codiceHost} – {h.nome} {h.cognome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => { setAbitazioniHostFilter(ALL_FILTER); setPageAbitazioni(1) }}>
                  Reset filtri
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                  <p className="text-muted-foreground col-span-full">Caricamento...</p>
                ) : filteredAbitazioni.length === 0 ? (
                  <p className="text-muted-foreground col-span-full">Nessuna abitazione.</p>
                ) : (
                  paginatedAbitazioni.map((a) => (
                    <Card key={a.id} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{a.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{a.indirizzo}</p>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>€ {a.prezzo} / notte · {a.postiLetto} posti letto</p>
                        <Button variant="link" size="sm" className="px-0 mt-2" onClick={() => startEditAbitazione(a)}>
                          Gestisci
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              {!loading && filteredAbitazioni.length > 0 && totalPagesAbitazioni > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Pagina {currentPageAbitazioni} di {totalPagesAbitazioni} · {filteredAbitazioni.length} abitazioni
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageAbitazioni((prev) => Math.max(1, prev - 1))}
                      disabled={currentPageAbitazioni <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" /> Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageAbitazioni((prev) => Math.min(totalPagesAbitazioni, prev + 1))}
                      disabled={currentPageAbitazioni >= totalPagesAbitazioni}
                    >
                      Successiva <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right sidebar */}
      <aside className="hidden xl:block w-80 shrink-0 space-y-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/logo.png" alt="Turista Facoltoso" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold">Ciao!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Accedi al backoffice per gestire utenti, prenotazioni e feedback.
                </p>
                <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-muted/50 text-sm">
                  <code className="flex-1 truncate">turistafacoltoso.it</code>
                  <Button variant="ghost" size="icon-xs">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">Report avanzati</h3>
                <p className="text-white/80 text-sm mt-1">Statistiche e query personalizzate</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <ExternalLink className="h-5 w-5" />
              </div>
            </div>
            <Button variant="secondary" size="sm" className="mt-4 w-full" asChild>
              <Link to="/report">Vai ai Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Promemoria</CardTitle>
              <Link to="/prenotazioni" className="text-sm text-[#2563eb] hover:underline">
                Tutti →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFeedback.length === 0 && allPrenotazioniSorted.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun promemoria.</p>
            ) : (
              <>
                {allPrenotazioniSorted.slice(0, 2).map((p: Prenotazione) => (
                  <div key={p.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-[#2563eb]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prenotazione #{p.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.dataInizio)} - {getAbitazione(p.abitazioneId)?.nome}
                      </p>
                    </div>
                  </div>
                ))}
                {recentFeedback.slice(0, 1).map((f) => {
                  const pren = prenotazioni.find((p) => p.id === f.prenotazioneId)
                  const ut = pren ? getUtente(pren.utenteId) : undefined
                  return (
                    <div key={f.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Nuovo feedback{ut ? ` · ${ut.nome} ${ut.cognome}` : ''}</p>
                        <p className="text-xs text-muted-foreground">★ {f.punteggio}/5</p>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Dialog Dettagli Prenotazione */}
      <Dialog open={!!dettaglioPrenotazione} onOpenChange={(open) => !open && setDettaglioPrenotazione(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettagli prenotazione #{dettaglioPrenotazione?.id}</DialogTitle>
          </DialogHeader>
          {dettaglioPrenotazione && (
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" /> Ospite
                </h4>
                <div className="pl-6 space-y-1 text-muted-foreground">
                  {(() => {
                    const u = getUtente(dettaglioPrenotazione.utenteId)
                    return u ? (
                      <>
                        <p className="text-foreground font-medium">{u.nome} {u.cognome}</p>
                        <p className="flex items-center gap-2"><Mail className="h-3.5 w-3" /> {u.email}</p>
                        {u.indirizzo && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3" /> {u.indirizzo}</p>}
                      </>
                    ) : (
                      <p>Utente #{dettaglioPrenotazione.utenteId}</p>
                    )
                  })()}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" /> Abitazione
                </h4>
                <div className="pl-6 space-y-1 text-muted-foreground">
                  {(() => {
                    const a = getAbitazione(dettaglioPrenotazione.abitazioneId)
                    return a ? (
                      <>
                        <p className="text-foreground font-medium">{a.nome}</p>
                        <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3" /> {a.indirizzo}</p>
                        <p>{a.locali} locali · {a.postiLetto} posti letto · € {a.prezzo}/notte</p>
                        <p className="text-xs">Disponibile dal {formatDate(a.dataInizio)} al {formatDate(a.dataFine)}</p>
                      </>
                    ) : (
                      <p>Abitazione #{dettaglioPrenotazione.abitazioneId}</p>
                    )
                  })()}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Periodo prenotazione
                </h4>
                <div className="pl-6">
                  <p className="text-foreground">
                    {formatDate(dettaglioPrenotazione.dataInizio)} → {formatDate(dettaglioPrenotazione.dataFine)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modifica Prenotazione */}
      <Dialog open={!!editingPrenotazione} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Modifica prenotazione #{editingPrenotazione?.id}</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2 shrink-0">
              {error}
            </div>
          )}
          <form
            className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="edit-dataInizio">Data inizio *</Label>
                <Input id="edit-dataInizio" type="date" value={editForm.dataInizio} onChange={(e) => setEditForm((f) => ({ ...f, dataInizio: e.target.value }))} required className="w-full min-w-0" />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="edit-dataFine">Data fine *</Label>
                <Input id="edit-dataFine" type="date" value={editForm.dataFine} onChange={(e) => setEditForm((f) => ({ ...f, dataFine: e.target.value }))} required className="w-full min-w-0" />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-utenteId">Utente *</Label>
              <Select value={editForm.utenteId ? String(editForm.utenteId) : ''} onValueChange={(v) => setEditForm((f) => ({ ...f, utenteId: v }))}>
                <SelectTrigger id="edit-utenteId" className="w-full min-w-0">
                  <SelectValue placeholder="Seleziona utente" />
                </SelectTrigger>
                <SelectContent>
                  {utenti.map((u) => (
                    <SelectItem key={u.id} value={String(u.id!)}>{u.nome} {u.cognome} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-abitazioneId">Abitazione *</Label>
              <Select value={editForm.abitazioneId ? String(editForm.abitazioneId) : ''} onValueChange={(v) => setEditForm((f) => ({ ...f, abitazioneId: v }))}>
                <SelectTrigger id="edit-abitazioneId" className="w-full min-w-0">
                  <SelectValue placeholder="Seleziona abitazione" />
                </SelectTrigger>
                <SelectContent>
                  {abitazioni.map((a) => (
                    <SelectItem key={a.id} value={String(a.id!)}>
                      {a.nome} – {a.indirizzo} (disponibile {a.dataInizio} → {a.dataFine})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end shrink-0">
              <Button type="button" variant="outline" onClick={closeEditDialog}>Annulla</Button>
              <Button
                type="button"
                onClick={() => saveEdit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)}
              >
                Salva
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifica Abitazione */}
      <Dialog open={!!editingAbitazione} onOpenChange={(open) => !open && closeEditAbitazioneDialog()}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Modifica abitazione {editingAbitazione?.nome}</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2 shrink-0">
              {error}
            </div>
          )}
          <form
            className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1"
            onSubmit={(e) => { e.preventDefault(); saveEditAbitazione(e) }}
          >
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-ab-nome">Nome *</Label>
              <Input id="edit-ab-nome" value={editFormAbitazione.nome} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-ab-indirizzo">Indirizzo *</Label>
              <Input id="edit-ab-indirizzo" value={editFormAbitazione.indirizzo} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, indirizzo: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="edit-ab-locali">Locali *</Label>
                <Input id="edit-ab-locali" type="number" min={1} value={editFormAbitazione.locali} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, locali: e.target.value }))} required />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="edit-ab-postiLetto">Posti letto *</Label>
                <Input id="edit-ab-postiLetto" type="number" min={1} value={editFormAbitazione.postiLetto} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, postiLetto: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-ab-piano">Piano (opzionale)</Label>
              <Input id="edit-ab-piano" type="number" value={editFormAbitazione.piano} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, piano: e.target.value }))} />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-ab-prezzo">Prezzo *</Label>
              <Input id="edit-ab-prezzo" type="number" step="0.01" min={0} value={editFormAbitazione.prezzo} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, prezzo: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="edit-ab-dataInizio">Data inizio *</Label>
                <Input id="edit-ab-dataInizio" type="date" value={editFormAbitazione.dataInizio} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, dataInizio: e.target.value }))} required />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="edit-ab-dataFine">Data fine *</Label>
                <Input id="edit-ab-dataFine" type="date" value={editFormAbitazione.dataFine} onChange={(e) => setEditFormAbitazione((f) => ({ ...f, dataFine: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-ab-hostId">Host *</Label>
              <Select value={editFormAbitazione.hostId ? String(editFormAbitazione.hostId) : ''} onValueChange={(v) => setEditFormAbitazione((f) => ({ ...f, hostId: v }))}>
                <SelectTrigger id="edit-ab-hostId" className="w-full min-w-0">
                  <SelectValue placeholder="Seleziona host" />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((h) => (
                    <SelectItem key={h.id} value={String(h.id!)}>{h.codiceHost} – {h.nome} {h.cognome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end shrink-0">
              <Button type="button" variant="outline" onClick={closeEditAbitazioneDialog}>Annulla</Button>
              <Button type="button" onClick={() => saveEditAbitazione({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)}>
                Salva
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
