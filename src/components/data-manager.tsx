import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Download, Loader2 } from 'lucide-react'
import { exportAllData } from '../server/data-export'
import { toast } from 'sonner'

export function DataManager() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = await exportAllData()

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `remindme-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Daten erfolgreich exportiert')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Fehler beim Exportieren der Daten')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm text-muted-foreground mb-4">
        Daten-Verwaltung
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-2">Export</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Exportiere alle deine Daten als JSON-Datei. Diese kann als Backup
            verwendet werden.
          </p>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            size="sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportiere...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Daten exportieren
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
            Import
          </h4>
          <p className="text-xs text-muted-foreground">
            Import-Funktionalität kann bei Bedarf hinzugefügt werden.
          </p>
        </div>
      </div>
    </Card>
  )
}
