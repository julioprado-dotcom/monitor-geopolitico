'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VeracityLevel } from '@/lib/types';
import { VERACITY_CONFIG } from '@/lib/types';
import { Clock, FileText, Link, Search } from 'lucide-react';

interface HistoryItem {
  id: string;
  inputType: string;
  inputContent: string;
  overallScore: number;
  veracityLevel: string;
  summary: string;
  createdAt: string;
}

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (id: string) => void;
}

const INPUT_TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  url: <Link className="w-4 h-4" />,
  claim: <Search className="w-4 h-4" />,
};

const LEVEL_COLORS: Record<string, string> = {
  verified: 'border-neon text-neon',
  dubious: 'border-trend text-trend',
  false: 'border-alert text-alert',
};

export function HistoryList({ items, onSelect }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aún no tienes verificaciones previas</p>
        <p className="text-xs mt-1">Las verificaciones aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const level = item.veracityLevel as VeracityLevel;
        const config = VERACITY_CONFIG[level];
        const date = new Date(item.createdAt);

        return (
          <Card
            key={item.id}
            className="cursor-pointer border-border/50 hover:border-neon/50 hover:shadow-md transition-all"
            onClick={() => onSelect(item.id)}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-3">
                <span className="text-muted-foreground mt-0.5 shrink-0">
                  {INPUT_TYPE_ICONS[item.inputType]}
                </span>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium truncate">
                    {item.inputContent.slice(0, 80)}
                    {item.inputContent.length > 80 ? '...' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.summary.slice(0, 100)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${LEVEL_COLORS[level] || 'border-muted text-muted-foreground'}`}
                    >
                      {item.overallScore}/100 — {config?.label || level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
