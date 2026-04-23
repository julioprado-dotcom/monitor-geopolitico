'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SilencedVoice } from '@/lib/types';
import { VolumeX } from '@/lib/icons';

interface SilencedVoicesProps {
  voices: SilencedVoice[];
}

export function SilencedVoices({ voices }: SilencedVoicesProps) {
  if (voices.length === 0) {
    return (
      <Card className="border-neon/20 bg-neon/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-neon">
            <VolumeX className="w-4 h-4" />
            <span className="text-sm">No se detectaron voces silenciadas significativas</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-trend/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <VolumeX className="w-5 h-5 text-trend" />
          <CardTitle className="text-sm font-semibold">
            Voces Silenciadas / Perspectivas Omitidas
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {voices.map((voice, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-trend/5 border border-trend/20"
          >
            <div className="flex items-start gap-2">
              <span className="text-trend font-bold text-sm mt-0.5">
                {idx + 1}.
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-trend">
                  {voice.perspective}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {voice.description}
                </p>
                <p className="text-xs text-trend/80 italic">
                  Contexto: {voice.context}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
