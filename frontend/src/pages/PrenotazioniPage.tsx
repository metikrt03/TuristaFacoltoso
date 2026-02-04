import { useState, useEffect, FormEvent } from 'react'
import { prenotazioniApi, utentiApi, abitazioniApi } from '@/services/api'
import type { Prenotazione, Utente, Abitazione } from '@/types'
import Loading from '@/components/Loading'
import ErrorMessage from '@/components/ErrorMessage'
import SuccessMessage from '@/components/SuccessMessage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const emptyForm = { dataInizio: '', dataFine: '', utenteId: '', abitazioneId: '' }
const PER_PAGE = 25

export default function PrenotazioniPage() {
  const [list, setList] = useState<Prenotazione[]>([])
  const [utenti, setUtenti] = useState<Utente[]>([])
  const [abitazioni, setAbitazioni] = useState<Abitazione[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Prenotazione | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginatedList = list.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const load = () => {
    setLoading(true)
    setError(null)
    setPage(1)
    Promise.all([prenotazioniApi.getAll(), utentiApi.getAll(), abitazioniApi.getAll()])
      .then(([prenotazioni, u, a]) => {
        setList(prenotazioni)
        setUtenti(u)
        setAbitazioni(a)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const validate = () => {
    const d1 = new Date(form.dataInizio)
    const d2 = new Date(form.dataFine)
    if (d2 < d1) {
      setError('La data fine deve essere successiva alla data inizio.')
      return false
    }
    if (form.abitazioneId) {
      const abitazione = abitazioni.find((a) => a.id === Number(form.abitazioneId))
      if (abitazione?.dataInizio && abitazione?.dataFine) {
        const dispInizio = new Date(abitazione.dataInizio)
        const dispFine = new Date(abitazione.dataFine)
        if (d1 < dispInizio || d2 > dispFine) {
          setError(
            `Le date devono essere nel periodo di disponibilità dell'abitazione (dal ${abitazione.dataInizio} al ${abitazione.dataFine}).`
          )
          return false
        }
      }
    }
    return true
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!validate()) return
    const payload = {
      dataInizio: form.dataInizio,
      dataFine: form.dataFine,
      utenteId: Number(form.utenteId),
      abitazioneId: Number(form.abitazioneId),
    }
    if (editing && editing.id) {
      prenotazioniApi.update(editing.id, payload)
        .then(() => { 
          setEditing(null)
          setForm(emptyForm)
          setDialogOpen(false)
          setSuccess('Prenotazione aggiornata con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    } else {
      prenotazioniApi.create(payload)
        .then(() => { 
          setForm(emptyForm)
          setSuccess('Prenotazione creata con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    }
  }

  const remove = (id: number) => {
    if (!confirm('Eliminare questa prenotazione?')) return
    setError(null)
    setSuccess(null)
    prenotazioniApi.delete(id)
      .then(() => { setSuccess('Prenotazione eliminata.'); load() })
      .catch((e) => setError(e.message))
  }

  const startEdit = (p: Prenotazione) => {
    setEditing(p)
    setForm({
      dataInizio: p.dataInizio,
      dataFine: p.dataFine,
      utenteId: String(p.utenteId),
      abitazioneId: String(p.abitazioneId),
    })
    setError(null)
    setSuccess(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setError(null)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Gestione Prenotazioni</h2>
        <p className="text-muted-foreground">Crea, modifica ed elimina prenotazioni degli utenti</p>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

      <Card>
        <CardHeader>
          <CardTitle>Nuova prenotazione</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group space-y-2">
                <Label htmlFor="dataInizio">Data inizio *</Label>
                <Input id="dataInizio" type="date" value={form.dataInizio} onChange={(e) => setForm((f) => ({ ...f, dataInizio: e.target.value }))} required />
              </div>
              <div className="form-group space-y-2">
                <Label htmlFor="dataFine">Data fine *</Label>
                <Input id="dataFine" type="date" value={form.dataFine} onChange={(e) => setForm((f) => ({ ...f, dataFine: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="utenteId">Utente *</Label>
              <Select value={form.utenteId ? String(form.utenteId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, utenteId: v }))}>
                <SelectTrigger id="utenteId" className="w-full">
                  <SelectValue placeholder="Seleziona utente" />
                </SelectTrigger>
                <SelectContent>
                  {utenti.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.nome} {u.cognome} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="abitazioneId">Abitazione *</Label>
              <Select value={form.abitazioneId ? String(form.abitazioneId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, abitazioneId: v }))}>
                <SelectTrigger id="abitazioneId" className="w-full">
                  <SelectValue placeholder="Seleziona abitazione" />
                </SelectTrigger>
                <SelectContent>
                  {abitazioni.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.nome} – {a.indirizzo} (disponibile {a.dataInizio} → {a.dataFine})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-actions">
              <Button type="submit">Crea</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica prenotazione</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group space-y-2">
                <Label htmlFor="edit-dataInizio">Data inizio *</Label>
                <Input id="edit-dataInizio" type="date" value={form.dataInizio} onChange={(e) => setForm((f) => ({ ...f, dataInizio: e.target.value }))} required />
              </div>
              <div className="form-group space-y-2">
                <Label htmlFor="edit-dataFine">Data fine *</Label>
                <Input id="edit-dataFine" type="date" value={form.dataFine} onChange={(e) => setForm((f) => ({ ...f, dataFine: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-utenteId">Utente *</Label>
              <Select value={form.utenteId ? String(form.utenteId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, utenteId: v }))}>
                <SelectTrigger id="edit-utenteId" className="w-full">
                  <SelectValue placeholder="Seleziona utente" />
                </SelectTrigger>
                <SelectContent>
                  {utenti.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.nome} {u.cognome} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-abitazioneId">Abitazione *</Label>
              <Select value={form.abitazioneId ? String(form.abitazioneId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, abitazioneId: v }))}>
                <SelectTrigger id="edit-abitazioneId" className="w-full">
                  <SelectValue placeholder="Seleziona abitazione" />
                </SelectTrigger>
                <SelectContent>
                  {abitazioni.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.nome} – {a.indirizzo} (disponibile {a.dataInizio} → {a.dataFine})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeDialog}>Annulla</Button>
              <Button type="submit">Salva</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Elenco</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Data inizio</TableHead>
                <TableHead>Data fine</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Abitazione</TableHead>
                <TableHead className="w-[180px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList.map((p) => {
                const utente = utenti.find((u) => u.id === p.utenteId)
                const abitazione = abitazioni.find((a) => a.id === p.abitazioneId)
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.dataInizio}</TableCell>
                    <TableCell>{p.dataFine}</TableCell>
                    <TableCell>{utente ? `${utente.nome} ${utente.cognome}` : `ID: ${p.utenteId}`}</TableCell>
                    <TableCell>{abitazione ? abitazione.nome : `ID: ${p.abitazioneId}`}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Modifica</Button>
                      <Button variant="destructive" size="sm" onClick={() => p.id && remove(p.id)} className="ml-2">Elimina</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {list.length > 0 && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">Pagina {currentPage} di {totalPages} · {list.length} prenotazioni</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                  <ChevronLeft className="h-4 w-4" /> Precedente
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                  Successiva <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
