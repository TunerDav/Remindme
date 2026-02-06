import { Badge } from './ui/badge'
import type { RelationshipScore } from '../server/scoring'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

type RelationshipScoreBadgeProps = {
  score: RelationshipScore
  showDetails?: boolean
}

export function RelationshipScoreBadge({
  score,
  showDetails = false,
}: RelationshipScoreBadgeProps) {
  const getColor = () => {
    switch (score.level) {
      case 'strong':
        return 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30'
      case 'good':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30'
      case 'weak':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30'
      case 'critical':
        return 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30'
      case 'none':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30'
    }
  }

  const getIcon = () => {
    switch (score.level) {
      case 'strong':
        return <TrendingUp className="h-3 w-3" />
      case 'good':
        return <TrendingUp className="h-3 w-3" />
      case 'weak':
        return <Minus className="h-3 w-3" />
      case 'critical':
        return <TrendingDown className="h-3 w-3" />
      case 'none':
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  if (!showDetails) {
    return (
      <Badge variant="outline" className={`gap-1 ${getColor()}`}>
        {getIcon()}
        {score.label} ({score.score})
      </Badge>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`gap-1 ${getColor()}`}>
          {getIcon()}
          {score.label}
        </Badge>
        <span className="text-2xl font-bold">{score.score}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Aktualität</p>
          <p className="font-medium">{score.recency}/50</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Häufigkeit</p>
          <p className="font-medium">{score.frequency}/30</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Vielfalt</p>
          <p className="font-medium">{score.variety}/20</p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        {score.lastInteractionDays !== null && (
          <p>
            Letzte Interaktion: vor {score.lastInteractionDays}{' '}
            {score.lastInteractionDays === 1 ? 'Tag' : 'Tagen'}
          </p>
        )}
        <p>
          {score.totalInteractions}{' '}
          {score.totalInteractions === 1 ? 'Interaktion' : 'Interaktionen'} in
          den letzten 6 Monaten
        </p>
      </div>
    </div>
  )
}
