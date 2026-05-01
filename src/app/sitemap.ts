import type { MetadataRoute } from 'next';
import { demoSignals } from '@/data/signals';
import { demoAnalysis } from '@/data/analysis';
import { demoThreads } from '@/data/threads';
import { regionLabels, type Region } from '@/data/signals';
import { type ThreadType, typeLabels } from '@/data/threads';
import { SITE_URL, CLASSIFIERS, ANALYSIS_FILTERS } from '@/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Página principal — prioridad máxima, actualización horaria
  const home: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ];

  // 2. Secciones principales (navegación por hash)
  const sections: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/#signals`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/#analysis`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#explorer`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  // 3. Páginas por región — indexables como facets de búsqueda
  const regions = Object.keys(regionLabels) as Region[];
  const regionPages: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${SITE_URL}/?region=${encodeURIComponent(r)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 4. Páginas por clasificador — organizan contenido temático para carousels
  const classifierPages: MetadataRoute.Sitemap = CLASSIFIERS.map((c) => ({
    url: `${SITE_URL}/?classifier=${encodeURIComponent(c)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 5. Páginas por filtro analítico — Óptica Sur Global
  const filterPages: MetadataRoute.Sitemap = ANALYSIS_FILTERS.map((f) => ({
    url: `${SITE_URL}/?filter=${encodeURIComponent(f)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // 6. Tipos de hilo en el explorador
  const threadTypes = Object.keys(typeLabels) as ThreadType[];
  const threadTypePages: MetadataRoute.Sitemap = threadTypes.map((t) => ({
    url: `${SITE_URL}/?threadType=${encodeURIComponent(t)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // 7. Señales individuales — señaladas para indexación profunda
  //    (cada señal tiene overlay con contenido único y análisis IA)
  const signalPages: MetadataRoute.Sitemap = demoSignals.map((s) => ({
    url: `${SITE_URL}/?signal=${encodeURIComponent(s.id)}`,
    lastModified: new Date(s.timestamp),
    changeFrequency: 'weekly' as const,
    priority: s.relevance === 'CRÍTICA' ? 0.7 : 0.5,
  }));

  // 8. Análisis individuales
  const analysisPages: MetadataRoute.Sitemap = demoAnalysis.map((a) => ({
    url: `${SITE_URL}/?analysis=${encodeURIComponent(a.id)}`,
    lastModified: new Date(a.timestamp),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 9. Hilos geopolíticos
  const threadPages: MetadataRoute.Sitemap = demoThreads.map((t) => ({
    url: `${SITE_URL}/?thread=${encodeURIComponent(t.id)}`,
    lastModified: new Date(t.lastActivityAt),
    changeFrequency: t.status === 'EN_VIVO' ? ('hourly' as const) : ('weekly' as const),
    priority: t.status === 'EN_VIVO' ? 0.7 : 0.5,
  }));

  return [
    ...home,
    ...sections,
    ...regionPages,
    ...classifierPages,
    ...filterPages,
    ...threadTypePages,
    ...signalPages,
    ...analysisPages,
    ...threadPages,
  ];
}
