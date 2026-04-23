'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SourceResult } from '@/lib/types';
import {
  SOURCE_CATEGORY_LABELS,
  SOURCE_CATEGORY_ICONS,
  ORIENTATION_LABELS,
  GEOPOLITICAL_LABELS,
  RELATION_LABELS,
} from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface SourceCardProps {
  source: SourceResult;
}

const RELATION_COLORS: Record<string, string> = {
  confirma: 'bg-neon/15 text-neon border-neon/30',
  contradice: 'bg-alert/15 text-alert border-alert/30',
  matiza: 'bg-trend/15 text-trend border-trend/30',
  sin_relacion: 'bg-muted text-muted-foreground border-border',
};

export function SourceCard({ source }: SourceCardProps) {
  return (
    <Card className="border-border/50 hover:border-neon/30 transition-colors overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{SOURCE_CATEGORY_ICONS[source.category]}</span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:text-neon transition-colors truncate flex items-center gap-1"
              >
                {source.name}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">{source.hostName}</p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${RELATION_COLORS[source.relationToNews]}`}
          >
            {RELATION_LABELS[source.relationToNews]}
          </Badge>
        </div>

        {/* Snippet */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {source.snippet}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {SOURCE_CATEGORY_LABELS[source.category]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {ORIENTATION_LABELS[source.orientation]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {GEOPOLITICAL_LABELS[source.geopoliticalPerspective]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
