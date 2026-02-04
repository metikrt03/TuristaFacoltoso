import { useState, useEffect, FormEvent } from 'react'
import { abitazioniApi, hostApi } from '@/services/api'
import type { Abitazione, Host } from '@/types'
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

const PER_PAGE = 25
const emptyForm = {
  nome: '', indirizzo: '', locali: '', postiLetto: '', piano: '', prezzo: '', dataInizio: '', dataFine: '', hostId: '',
}

export default function AbitazioniPage() {
  const [list, setList] = useState<Abitazione[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Abitazione | null>(null)
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
    Promise.all([abitazioniApi.getAll(), hostApi.getAll()])
      .then(([abitazioni, hostList]) => {
        setList(abitazioni)
        setHosts(hostList)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const resetForm = () => setForm(emptyForm)

  const validate = () => {
    if (!form.nome?.trim()) { setError('Il nome è obbligatorio.'); return false }
    if (!form.indirizzo?.trim()) { setError('L\'indirizzo è obbligatorio.'); return false }
    const locali = Number(form.locali)
    if (!Number.isInteger(locali) || locali < 1) { setError('Locali deve essere un numero intero ≥ 1.'); return false }
    const posti = Number(form.postiLetto)
    if (!Number.isInteger(posti) || posti < 1) { setError('Posti letto deve essere un numero intero ≥ 1.'); return false }
    const prezzo = Number(form.prezzo)
    if (Number.isNaN(prezzo) || prezzo < 0) { setError('Il prezzo deve essere ≥ 0.'); return false }
    if (!form.dataInizio) { setError('La data inizio è obbligatoria.'); return false }
    if (!form.dataFine) { setError('La data fine è obbligatoria.'); return false }
    if (new Date(form.dataFine) < new Date(form.dataInizio)) {
      setError('La data fine deve essere successiva alla data inizio.')
      return false
    }
    if (!form.hostId) { setError('Selezionare un host.'); return false }
    return true
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!validate()) return
    const payload = {
      nome: form.nome,
      indirizzo: form.indirizzo,
      locali: Number(form.locali),
      postiLetto: Number(form.postiLetto),
      piano: form.piano ? Number(form.piano) : undefined,
      prezzo: Number(form.prezzo),
      dataInizio: form.dataInizio,
      dataFine: form.dataFine,
      hostId: Number(form.hostId),
    }
    if (editing && editing.id) {
      abitazioniApi.update(editing.id, payload)
        .then(() => { 
          setEditing(null)
          resetForm()
          setDialogOpen(false)
          setSuccess('Abitazione aggiornata con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    } else {
      abitazioniApi.create(payload)
        .then(() => { 
          resetForm()
          setSuccess('Abitazione creata con successo.')
          load()
        })
        .catch((e) => setError(e.message))
    }
  }

  const remove = (id: number) => {
    if (!confirm('Eliminare questa abitazione?')) return
    setError(null)
    setSuccess(null)
    abitazioniApi.delete(id)
      .then(() => { setSuccess('Abitazione eliminata.'); load() })
      .catch((e) => setError(e.message))
  }

  const startEdit = (a: Abitazione) => {
    setEditing(a)
    setForm({
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
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
    resetForm()
    setError(null)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Gestione Abitazioni</h2>
        <p className="text-muted-foreground">Crea, modifica ed elimina abitazioni disponibili</p>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

      <Card>
        <CardHeader>
          <CardTitle>Nuova abitazione</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="form-group space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="indirizzo">Indirizzo *</Label>
              <Input id="indirizzo" value={form.indirizzo} onChange={(e) => setForm((f) => ({ ...f, indirizzo: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group space-y-2">
                <Label htmlFor="locali">Locali *</Label>
                <Input id="locali" type="number" min={1} value={form.locali} onChange={(e) => setForm((f) => ({ ...f, locali: e.target.value }))} required />
              </div>
              <div className="form-group space-y-2">
                <Label htmlFor="postiLetto">Posti letto *</Label>
                <Input id="postiLetto" type="number" min={1} value={form.postiLetto} onChange={(e) => setForm((f) => ({ ...f, postiLetto: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="piano">Piano (opzionale)</Label>
              <Input id="piano" type="number" value={form.piano} onChange={(e) => setForm((f) => ({ ...f, piano: e.target.value }))} />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="prezzo">Prezzo *</Label>
              <Input id="prezzo" type="number" step="0.01" min={0} value={form.prezzo} onChange={(e) => setForm((f) => ({ ...f, prezzo: e.target.value }))} required />
            </div>
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
              <Label htmlFor="hostId">Host *</Label>
              <Select value={form.hostId ? String(form.hostId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, hostId: v }))}>
                <SelectTrigger id="hostId" className="w-full">
                  <SelectValue placeholder="Seleziona host" />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)}>{h.codiceHost} – {h.nome} {h.cognome}</SelectItem>
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
            <DialogTitle>Modifica abitazione</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="form-group space-y-2">
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input id="edit-nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-indirizzo">Indirizzo *</Label>
              <Input id="edit-indirizzo" value={form.indirizzo} onChange={(e) => setForm((f) => ({ ...f, indirizzo: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group space-y-2">
                <Label htmlFor="edit-locali">Locali *</Label>
                <Input id="edit-locali" type="number" min={1} value={form.locali} onChange={(e) => setForm((f) => ({ ...f, locali: e.target.value }))} required />
              </div>
              <div className="form-group space-y-2">
                <Label htmlFor="edit-postiLetto">Posti letto *</Label>
                <Input id="edit-postiLetto" type="number" min={1} value={form.postiLetto} onChange={(e) => setForm((f) => ({ ...f, postiLetto: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-piano">Piano (opzionale)</Label>
              <Input id="edit-piano" type="number" value={form.piano} onChange={(e) => setForm((f) => ({ ...f, piano: e.target.value }))} />
            </div>
            <div className="form-group space-y-2">
              <Label htmlFor="edit-prezzo">Prezzo *</Label>
              <Input id="edit-prezzo" type="number" step="0.01" min={0} value={form.prezzo} onChange={(e) => setForm((f) => ({ ...f, prezzo: e.target.value }))} required />
            </div>
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
              <Label htmlFor="edit-hostId">Host *</Label>
              <Select value={form.hostId ? String(form.hostId) : ''} onValueChange={(v) => setForm((f) => ({ ...f, hostId: v }))}>
                <SelectTrigger id="edit-hostId" className="w-full">
                  <SelectValue placeholder="Seleziona host" />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)}>{h.codiceHost} – {h.nome} {h.cognome}</SelectItem>
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
                <TableHead>Nome</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead>Locali</TableHead>
                <TableHead>Posti letto</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Host</TableHead>
                <TableHead className="w-[180px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList.map((a) => {
                const host = hosts.find((h) => h.id === a.hostId)
                return (
                  <TableRow key={a.id}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>{a.nome}</TableCell>
                    <TableCell>{a.indirizzo}</TableCell>
                    <TableCell>{a.locali}</TableCell>
                    <TableCell>{a.postiLetto}</TableCell>
                    <TableCell>€ {a.prezzo}</TableCell>
                    <TableCell>{host ? `${host.nome} ${host.cognome}` : `ID: ${a.hostId}`}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => startEdit(a)}>Modifica</Button>
                      <Button variant="destructive" size="sm" onClick={() => a.id && remove(a.id)} className="ml-2">Elimina</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {list.length > 0 && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">Pagina {currentPage} di {totalPages} · {list.length} abitazioni</p>
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
