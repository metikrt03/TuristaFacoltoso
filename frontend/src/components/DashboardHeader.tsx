import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Search } from 'lucide-react'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onSearch?: (q: string) => void
}

export default function DashboardHeader({ title, subtitle = 'Bentornato!', onSearch }: DashboardHeaderProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!onSearch) return
    const t = setTimeout(() => onSearch(query), 250)
    return () => clearTimeout(t)
  }, [query, onSearch])

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:flex-initial sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca..."
            className="pl-9 bg-muted/50"
            value={query}
            onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
        </div>

        <Avatar className="h-9 w-9 shrink-0 rounded-lg">
          <AvatarImage src="/logo.png" alt="Turista Facoltoso" className="object-contain bg-background" />
          <AvatarFallback className="rounded-lg bg-[#2563eb]/10 text-[#2563eb] text-xs">TF</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
