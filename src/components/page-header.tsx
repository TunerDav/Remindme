import { ChevronLeft } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export interface PageHeaderProps {
  title: string
  showBack?: boolean
  description?: string
  backUrl?: string
  action?: React.ReactNode
}

export function PageHeader({ title, showBack, action }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => router.history.back()} className="h-9 w-9 -ml-2 rounded-xl">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Zurück</span>
            </Button>
          )}
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
