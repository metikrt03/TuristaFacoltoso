import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface SuccessMessageProps {
  message: string | null
  onDismiss?: () => void
}

export default function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  if (!message) return null
  return (
    <Alert className="flex items-center justify-between gap-4 border-green-500 bg-green-50 dark:bg-green-950">
      <AlertDescription>{message}</AlertDescription>
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
