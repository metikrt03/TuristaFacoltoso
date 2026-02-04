import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  message: string | null
  onDismiss?: () => void
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null
  return (
    <Alert variant="destructive" className="flex items-center justify-between gap-4">
      <div>
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          aria-label="Chiudi"
          className="shrink-0"
        >
          ×
        </Button>
      )}
    </Alert>
  )
}
