import { useState, useEffect, FormEvent } from 'react'
import { feedbackApi, prenotazioniApi } from '@/services/api'
import type { Feedback, Prenotazione } from '@/types'
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
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const emptyForm = { titolo: '', testo: '', punteggio: '', prenotazioneId: '' }

export default function FeedbackPage() {
  const [list, setList] = useState<Feedback[]>([])
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Feedback | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([feedbackApi.getAll(), prenotazioniApi.getAll()])
      .then(([feedback, p]) => {
        setList(feedback)
        setPrenotazioni(p)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const validate = () => {
    const p = Number(form.punteggio)
    if (p < 1 || p > 5) {
      setError('Il punteggio deve essere tra 1 e 5.')
      return false
    }
    return true
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!validate()) return
    const payload = {
      titolo: form.titolo,
      testo: form.testo,
      punteggio: Number(form.punteggio),
      prenotazioneId: Number(form.prenotazioneId),
    }
    if (editing && editing.id) {
      feedbackApi.update(editing.id, payload)
        .then(() => { 
          setEditing(null)
          setForm(emptyForm)
          setDialogOpen(false)
          setSuccess('Feedback aggiornato con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    } else {
      feedbackApi.create(payload)
        .then(() => { 
          setForm(emptyForm)
          setSuccess('Feedback creato con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    }
  }

  const remove = (id: number) => {
    if (!confirm('Eliminare questo feedback?')) return
    setError(null)
    setSuccess(null)
    feedbackApi.delete(id)
      .then(() => { setSuccess('Feedback eliminato.'); load() })
      .catch((e) => setError(e.message))
  }

  const startEdit = (f: Feedback) => {
    setEditing(f)
    setForm({
      titolo: f.titolo || '',
      testo: f.testo || '',
      punteggio: String(f.punteggio),
      prenotazioneId: String(f.prenotazioneId),
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
        <h2 className="text-3xl font-bold tracking-tight mb-2">Gestione Feedback</h2>
        <p className="text-muted-foreground">Visualizza e gestisci i feedback delle prenotazioni</p>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

      <Card>
        <CardHeader>
          <CardTitle>Nuovo feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="form-group space-y-2">
              <Label htmlFor="titolo">Titolo</Label>
              <Input id="titolo" value={form.titolo} onChange={(e) => setForm((f) => ({ ...f, titolo: e.target.value }))} />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="testo">Testo</Label>
              <Textarea id="testo" value={form.testo} onChange={(e) => setForm((f) => ({ ...f, testo: e.target.value }))} rows={3} />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="punteggio">Punteggio (1–5) *</Label>
              <Input id="punteggio" type="number" min={1} max={5} value={form.punteggio} onChange={(e) => setForm((f) => ({ ...f, punteggio: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="prenotazioneId">Prenotazione *</Label>
              <Select value={form.prenotazioneId ? String(form.prenotazioneId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, prenotazioneId: v }))}>
                <SelectTrigger id="prenotazioneId" className="w-full">
                  <SelectValue placeholder="Seleziona prenotazione" />
                </SelectTrigger>
                <SelectContent>
                  {prenotazioni.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>Prenotazione #{p.id} – {p.dataInizio} / {p.dataFine}</SelectItem>
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
            <DialogTitle>Modifica feedback</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="form-group space-y-2">
              <Label htmlFor="edit-titolo">Titolo</Label>
              <Input id="edit-titolo" value={form.titolo} onChange={(e) => setForm((f) => ({ ...f, titolo: e.target.value }))} />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-testo">Testo</Label>
              <Textarea id="edit-testo" value={form.testo} onChange={(e) => setForm((f) => ({ ...f, testo: e.target.value }))} rows={3} />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-punteggio">Punteggio (1–5) *</Label>
              <Input id="edit-punteggio" type="number" min={1} max={5} value={form.punteggio} onChange={(e) => setForm((f) => ({ ...f, punteggio: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-prenotazioneId">Prenotazione *</Label>
              <Select value={form.prenotazioneId ? String(form.prenotazioneId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, prenotazioneId: v }))}>
                <SelectTrigger id="edit-prenotazioneId" className="w-full">
                  <SelectValue placeholder="Seleziona prenotazione" />
                </SelectTrigger>
                <SelectContent>
                  {prenotazioni.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>Prenotazione #{p.id} – {p.dataInizio} / {p.dataFine}</SelectItem>
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
                <TableHead>Titolo</TableHead>
                <TableHead>Punteggio</TableHead>
                <TableHead>Prenotazione</TableHead>
                <TableHead className="w-[180px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((f) => {
                const prenotazione = prenotazioni.find((p) => p.id === f.prenotazioneId)
                return (
                  <TableRow key={f.id}>
                    <TableCell>{f.id}</TableCell>
                    <TableCell>{f.titolo || '-'}</TableCell>
                    <TableCell>{f.punteggio}</TableCell>
                    <TableCell>
                      {prenotazione 
                        ? `#${prenotazione.id} (${prenotazione.dataInizio} → ${prenotazione.dataFine})` 
                        : `ID: ${f.prenotazioneId}`}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => startEdit(f)}>Modifica</Button>
                      <Button variant="destructive" size="sm" onClick={() => f.id && remove(f.id)} className="ml-2">Elimina</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
