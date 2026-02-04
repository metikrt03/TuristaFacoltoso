export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
      <p className="text-sm">Caricamento…</p>
    </div>
  )
}
