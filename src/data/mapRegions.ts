/**
 * Map region data for the GeoMap component.
 * Approximate centroid coordinates (as percentages) for each geopolitical region,
 * mapped to an SVG viewBox of 1000×500.
 */

import type { Region } from '@/types';

export interface MapRegion {
  region: Region;
  label: string;
  cx: number; // center x in viewBox units (0–1000)
  cy: number; // center y in viewBox units (0–500)
}

/** Approximate centroid positions per region on a 1000×500 SVG viewBox */
export const mapRegions: MapRegion[] = [
  { region: 'LATINOAMÉRICA', label: 'Latinoamérica', cx: 250, cy: 340 },
  { region: 'EUROPA', label: 'Europa', cx: 510, cy: 135 },
  { region: 'ASIA', label: 'Asia-Pacífico', cx: 750, cy: 175 },
  { region: 'ÁFRICA', label: 'África', cx: 520, cy: 300 },
  { region: 'MEDIO ORIENTE', label: 'Medio Oriente', cx: 595, cy: 210 },
  { region: 'NORTEAMÉRICA', label: 'Norteamérica', cx: 185, cy: 155 },
];

/**
 * Simplified SVG path data for each region's continent/zone shape.
 * These are stylized outlines — not geographically precise, but recognizable.
 * All paths are designed for a viewBox of "0 0 1000 500".
 */
export const continentPaths: Record<Region, string> = {
  NORTEAMÉRICA: `
    M 60,60 C 70,50 100,40 140,42 C 170,44 200,50 230,65
    C 250,75 265,90 275,110 C 280,125 278,145 270,165
    C 265,180 252,195 235,210 C 220,225 200,235 185,242
    C 175,248 165,250 155,248 C 145,244 138,235 130,225
    C 118,208 108,190 100,170 C 90,145 82,125 75,105
    C 68,85 62,72 60,60 Z
  `,
  LATINOAMÉRICA: `
    M 185,252 C 195,260 210,275 225,295
    C 240,315 252,340 258,365 C 262,385 260,405 250,420
    C 242,432 228,440 215,445 C 200,448 188,445 178,435
    C 168,422 160,405 155,385 C 150,365 148,345 150,325
    C 152,305 158,285 168,268 C 175,255 180,250 185,252 Z
  `,
  EUROPA: `
    M 460,60 C 475,55 495,52 515,55
    C 535,58 550,65 560,78 C 568,90 570,105 565,120
    C 560,132 548,142 535,148 C 520,153 505,155 490,152
    C 475,148 465,140 458,128 C 452,115 450,100 452,85
    C 454,72 456,65 460,60 Z
  `,
  ÁFRICA: `
    M 475,230 C 490,225 510,222 530,225
    C 550,228 570,238 585,255 C 598,270 608,290 612,312
    C 615,335 610,358 600,378 C 588,395 572,408 555,418
    C 538,425 520,428 505,425 C 490,420 478,410 468,395
    C 458,378 452,358 450,338 C 448,318 450,298 455,280
    C 460,265 468,245 475,230 Z
  `,
  'MEDIO ORIENTE': `
    M 565,165 C 580,158 598,155 615,160
    C 630,165 642,175 648,190 C 652,202 650,215 642,225
    C 635,233 622,238 610,240 C 598,240 586,235 578,225
    C 570,215 565,202 563,188 C 562,178 563,170 565,165 Z
  `,
  ASIA: `
    M 620,40 C 645,32 675,28 710,35
    C 740,42 765,55 785,75 C 800,92 810,115 815,140
    C 818,160 815,182 805,200 C 792,220 775,232 755,238
    C 735,242 715,240 695,232 C 675,222 658,208 645,190
    C 632,172 625,152 622,132 C 620,112 620,92 622,75
    C 624,58 627,48 630,42 L 620,40 Z
  `,
};

/** Slight random jitter per signal so multiple markers in the same region don't overlap */
export function jitterPosition(signalId: string, baseCx: number, baseCy: number): { cx: number; cy: number } {
  let hash = 0;
  for (let i = 0; i < signalId.length; i++) {
    hash = ((hash << 5) - hash + signalId.charCodeAt(i)) | 0;
  }
  const range = 25;
  const jitterX = ((hash & 0xFF) / 255) * range - range / 2;
  const jitterY = (((hash >> 8) & 0xFF) / 255) * range - range / 2;
  return { cx: baseCx + jitterX, cy: baseCy + jitterY };
}
