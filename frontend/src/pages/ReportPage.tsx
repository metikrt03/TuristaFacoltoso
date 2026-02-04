import { useState, useEffect } from 'react'
import { abitazioniApi, prenotazioniApi, hostApi, utentiApi } from '@/services/api'
import type { Abitazione, Prenotazione, Utente } from '@/types'
import Loading from '@/components/Loading'
import ErrorMessage from '@/components/ErrorMessage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ReportPage() {
  const [loadingReports, setLoadingReports] = useState(true)
  const [loadingUltima, setLoadingUltima] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [abitazioniHost, setAbitazioniHost] = useState<Abitazione[]>([])
  const [codiceHost, setCodiceHost] = useState('HOST001')

  const [utenti, setUtenti] = useState<Utente[]>([])
  const [ultimaPrenotazione, setUltimaPrenotazione] = useState<Prenotazione | null>(null)
  const [utenteIdPrenot, setUtenteIdPrenot] = useState('')

  const [piuGettonata, setPiuGettonata] = useState<any>(null)
  const [hostTopPrenot, setHostTopPrenot] = useState<any[]>([])
  const [superHost, setSuperHost] = useState<any[]>([])
  const [topUtentiGiorni, setTopUtentiGiorni] = useState<any[]>([])
  const [mediaPostiLetto, setMediaPostiLetto] = useState<number | null>(null)

  const loadAbitazioniHost = () => {
    setError(null)
    abitazioniApi.getByHostCode(codiceHost)
      .then(setAbitazioniHost)
      .catch((e) => setError(e.message))
  }

  const loadUltimaPrenotazione = () => {
    if (!utenteIdPrenot) return
    setError(null)
    setLoadingUltima(true)
    setUltimaPrenotazione(null)
    prenotazioniApi.getUltimaByUtente(Number(utenteIdPrenot))
      .then(setUltimaPrenotazione)
      .catch((e) => { setError(e.message); setUltimaPrenotazione(null); })
      .finally(() => setLoadingUltima(false))
  }

  const loadAllReports = () => {
    setLoadingReports(true)
    setError(null)
    Promise.all([
      utentiApi.getAll(),
      abitazioniApi.piuGettonata(),
      hostApi.topPrenotazioni(),
      hostApi.superHost(),
      utentiApi.topGiorni(),
      abitazioniApi.mediaPostiLetto(),
    ])
      .then(([utentiList, gettonata, topHost, superH, topUtenti, media]: [Utente[], any, any, any, any, any]) => {
        setUtenti(Array.isArray(utentiList) ? utentiList : [])
        setPiuGettonata(gettonata)
        setHostTopPrenot(Array.isArray(topHost) ? topHost : [])
        setSuperHost(Array.isArray(superH) ? superH : [])
        setTopUtentiGiorni(Array.isArray(topUtenti) ? topUtenti : [])
        const val = media && typeof media === 'object' && 'mediaPostiLetto' in media ? media.mediaPostiLetto : media
        setMediaPostiLetto(val != null ? Number(val) : null)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingReports(false))
  }

  useEffect(loadAllReports, [])

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Report e Statistiche</h2>
        <p className="text-muted-foreground">Consulta le statistiche e le query predefinite del sistema</p>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      <Card>
        <CardHeader>
          <CardTitle>1. Abitazioni per codice host</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="form-group space-y-2 max-w-[200px]">
            <Label htmlFor="codiceHost">Codice host</Label>
            <Input id="codiceHost" value={codiceHost} onChange={(e) => setCodiceHost(e.target.value)} placeholder="es. HOST001" />
          </div>
          <Button onClick={loadAbitazioniHost}>Cerca</Button>
          {abitazioniHost.length === 0 ? (
            <p className="muted">Nessuna abitazione. Inserisci un codice host valido e clicca Cerca.</p>
          ) : (
            <ul className="report-list">
              {abitazioniHost.map((a) => <li key={a.id}>{a.nome} – {a.indirizzo}</li>)}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Ultima prenotazione per utente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="form-group space-y-2 max-w-[280px]">
            <Label>Utente</Label>
            <Select value={utenteIdPrenot} onValueChange={setUtenteIdPrenot}>
              <SelectTrigger id="utenteIdPrenot" className="w-full">
                <SelectValue placeholder="Seleziona un utente" />
              </SelectTrigger>
              <SelectContent>
                {utenti.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.nome} {u.cognome} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadUltimaPrenotazione} disabled={loadingUltima || !utenteIdPrenot}>Cerca</Button>
          {loadingUltima && <Loading />}
          {!loadingUltima && ultimaPrenotazione && (
            <p>Prenotazione #{ultimaPrenotazione.id}: {ultimaPrenotazione.dataInizio} → {ultimaPrenotazione.dataFine}</p>
          )}
          {!loadingUltima && !ultimaPrenotazione && utenteIdPrenot !== '' && <p className="muted">Nessuna prenotazione trovata per questo utente.</p>}
        </CardContent>
      </Card>

      {loadingReports ? (
        <Card><CardContent className="pt-6"><Loading /></CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>3. Abitazione più gettonata (ultimo mese)</CardTitle>
            </CardHeader>
            <CardContent>
              {piuGettonata ? <p>{piuGettonata.nome} – {piuGettonata.indirizzo}</p> : <p className="muted">Nessuna prenotazione nell'ultimo mese.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Host con più prenotazioni (ultimo mese)</CardTitle>
            </CardHeader>
            <CardContent>
              {hostTopPrenot.length === 0 ? <p className="muted">Nessun dato.</p> : (
                <ul className="report-list">
                  {hostTopPrenot.map((h) => <li key={h.id}>{h.codiceHost} – {h.nome} {h.cognome}</li>)}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Super-host (≥100 prenotazioni)</CardTitle>
            </CardHeader>
            <CardContent>
              {superHost.length === 0 ? <p className="muted">Nessun super-host.</p> : (
                <ul className="report-list">
                  {superHost.map((h) => <li key={h.id}>{h.codiceHost} – {h.nome} {h.cognome}</li>)}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Top 5 utenti per giorni prenotati (ultimo mese)</CardTitle>
            </CardHeader>
            <CardContent>
              {topUtentiGiorni.length === 0 ? <p className="muted">Nessun dato.</p> : (
                <ul className="report-list">
                  {topUtentiGiorni.map((u) => <li key={u.id}>{u.nome} {u.cognome} ({u.email})</li>)}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Media posti letto (tutte le abitazioni)</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{mediaPostiLetto != null ? Number(mediaPostiLetto).toFixed(2) : '-'}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
