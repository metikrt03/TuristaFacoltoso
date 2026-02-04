import { useState, useEffect, FormEvent } from 'react'
import { utentiApi } from '@/services/api'
import type { Utente } from '@/types'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emptyForm = { nome: '', cognome: '', email: '', indirizzo: '' }

export default function UtentiPage() {
  const [list, setList] = useState<Utente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Utente | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    utentiApi.getAll()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const validate = () => {
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
      utentiApi.update(editing.id, payload)
        .then(() => { 
          setEditing(null)
          setForm(emptyForm)
          setDialogOpen(false)
          setSuccess('Utente aggiornato con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    } else {
      utentiApi.create(payload)
        .then(() => { 
          setForm(emptyForm)
          setSuccess('Utente creato con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    }
  }

  const remove = (id: number) => {
    if (!confirm('Eliminare questo utente?')) return
    setError(null)
    setSuccess(null)
    utentiApi.delete(id)
      .then(() => { setSuccess('Utente eliminato.'); load() })
      .catch((e) => setError(e.message))
  }

  const startEdit = (u: Utente) => {
    setEditing(u)
    setForm({ nome: u.nome, cognome: u.cognome, email: u.email, indirizzo: u.indirizzo || '' })
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
        <h2 className="text-3xl font-bold tracking-tight mb-2">Gestione Utenti</h2>
        <p className="text-muted-foreground">Crea, modifica ed elimina utenti del sistema</p>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

      <Card>
        <CardHeader>
          <CardTitle>Nuovo utente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica utente</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
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
                <TableHead>Nome</TableHead>
                <TableHead>Cognome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead className="w-[180px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.nome}</TableCell>
                  <TableCell>{u.cognome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.indirizzo || '-'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => startEdit(u)}>Modifica</Button>
                    <Button variant="destructive" size="sm" onClick={() => u.id && remove(u.id)} className="ml-2">Elimina</Button>
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
