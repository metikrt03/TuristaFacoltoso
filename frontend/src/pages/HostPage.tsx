import { useState, useEffect, FormEvent } from 'react'
import { hostApi } from '@/services/api'
import type { Host } from '@/types'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Codice host: HOST + 3 cifre (es. HOST001, HOST002) */
const CODICE_HOST_REGEX = /^HOST\d{3}$/
const emptyForm = { nome: '', cognome: '', email: '', indirizzo: '', codiceHost: '' }

export default function HostPage() {
  const [list, setList] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Host | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    hostApi.getAll()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const validate = () => {
    if (!form.codiceHost?.trim()) { setError('Il codice host è obbligatorio.'); return false }
    if (!CODICE_HOST_REGEX.test(form.codiceHost.trim())) {
      setError('Il codice host deve essere nel formato HOST + 3 cifre (es. HOST001, HOST002).')
      return false
    }
    if (!form.nome?.trim()) { setError('Il nome è obbligatorio.'); return false }
    if (!form.cognome?.trim()) { setError('Il cognome è obbligatorio.'); return false }
    if (!form.email?.trim()) { setError('L\'email è obbligatoria.'); return false }
    if (!EMAIL_REGEX.test(form.email)) { setError('Inserire un\'email valida.'); return false }
    return true
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!validate()) return
    const payload = { ...form }
    if (editing && editing.id) {
      hostApi.update(editing.id, payload)
        .then(() => { 
          setEditing(null)
          setForm(emptyForm)
          setDialogOpen(false)
          setSuccess('Host aggiornato con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    } else {
      hostApi.create(payload)
        .then(() => { 
          setForm(emptyForm)
          setSuccess('Host creato con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    }
  }

  const remove = (id: number) => {
    if (!confirm('Eliminare questo host?')) return
    setError(null)
    setSuccess(null)
    hostApi.delete(id)
      .then(() => { setSuccess('Host eliminato.'); load() })
      .catch((e) => setError(e.message))
  }

  const startEdit = (h: Host) => {
    setEditing(h)
    setForm({ nome: h.nome, cognome: h.cognome, email: h.email, indirizzo: h.indirizzo || '', codiceHost: h.codiceHost })
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
        <h2 className="text-3xl font-bold tracking-tight mb-2">Gestione Host</h2>
        <p className="text-muted-foreground">Crea, modifica ed elimina host del sistema</p>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

      <Card>
        <CardHeader>
          <CardTitle>Nuovo host</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="form-group space-y-2">
              <Label htmlFor="codiceHost">Codice host * (es. HOST001, HOST002)</Label>
              <Input id="codiceHost" value={form.codiceHost} onChange={(e) => setForm((f) => ({ ...f, codiceHost: e.target.value.toUpperCase() }))} placeholder="HOST001" required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="cognome">Cognome *</Label>
              <Input id="cognome" value={form.cognome} onChange={(e) => setForm((f) => ({ ...f, cognome: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="indirizzo">Indirizzo</Label>
              <Input id="indirizzo" value={form.indirizzo} onChange={(e) => setForm((f) => ({ ...f, indirizzo: e.target.value }))} />
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
            <DialogTitle>Modifica host</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="form-group space-y-2">
              <Label htmlFor="edit-codiceHost">Codice host * (es. HOST001, HOST002)</Label>
              <Input id="edit-codiceHost" value={form.codiceHost} onChange={(e) => setForm((f) => ({ ...f, codiceHost: e.target.value.toUpperCase() }))} placeholder="HOST001" required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input id="edit-nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-cognome">Cognome *</Label>
              <Input id="edit-cognome" value={form.cognome} onChange={(e) => setForm((f) => ({ ...f, cognome: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input id="edit-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-indirizzo">Indirizzo</Label>
              <Input id="edit-indirizzo" value={form.indirizzo} onChange={(e) => setForm((f) => ({ ...f, indirizzo: e.target.value }))} />
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
                <TableHead>Codice</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cognome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[180px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{h.id}</TableCell>
                  <TableCell>{h.codiceHost}</TableCell>
                  <TableCell>{h.nome}</TableCell>
                  <TableCell>{h.cognome}</TableCell>
                  <TableCell>{h.email}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => startEdit(h)}>Modifica</Button>
                    <Button variant="destructive" size="sm" onClick={() => h.id && remove(h.id)} className="ml-2">Elimina</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
