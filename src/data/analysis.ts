export interface Analysis {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  author: string;
  authorRole: string;
  timestamp: string;
  region: string;
  tags: string[];
  readTime: number; // minutos
  image?: string;
}

export const demoAnalysis: Analysis[] = [
  {
    id: 'ANL-001',
    title: 'La geopolítica del litio: por qué Bolivia, Chile y Argentina pueden redefinir el poder global',
    summary: 'El Triángulo del Litio concentra más del 60% de las reservas mundiales del mineral estratégico del siglo XXI. Sin embargo, las estrategias de explotación difieren radicalmente entre los tres países, reflejando modelos de desarrollo opuestos que determinarán su peso geopolítico frente a China y EE.UU. en la carrera por la transición energética.',
    fullContent: '',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-28T10:00:00Z',
    region: 'LATINOAMÉRICA',
    tags: ['Economía', 'Energía', 'Diplomacia'],
    readTime: 8,
    image: '/signals/sig-026.webp',
  },
  {
    id: 'ANL-002',
    title: 'El eje multipolar BRICS+ y el fin del consenso de Washington: análisis estructural',
    summary: 'La expansión del BRICS a más de 10 miembros marca un punto de inflexión en la arquitectura financiera global. El nuevo Banco de Desarrollo no solo compite con el FMI y el Banco Mundial, sino que propone un paradigma de financiamiento sin condicionalidades políticas, desafiando directamente los mecanismos de control del Norte Global sobre las economías del Sur.',
    fullContent: '',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-26T14:00:00Z',
    region: 'LATINOAMÉRICA',
    tags: ['Diplomacia', 'Economía', 'Tecnología'],
    readTime: 12,
  },
  {
    id: 'ANL-003',
    title: 'Ciberseguridad soberana: cómo Cuba y Rusia construyen alternativas a la infraestructura digital occidental',
    summary: 'El despliegue de la red 5G cubana con tecnología conjunta China-Rusia no es un evento aislado. Es parte de una estrategia coordinada para construir infraestructura digital soberana que eluda el control de corporaciones estadounidenses y europeas. Este análisis examina las implicaciones para la soberanía digital del Sur Global.',
    fullContent: '',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-24T09:00:00Z',
    region: 'LATINOAMÉRICA',
    tags: ['Tecnología', 'Seguridad', 'Diplomacia'],
    readTime: 7,
    image: '/signals/sig-033.webp',
  },
  {
    id: 'ANL-004',
    title: 'África como laboratorio geopolítico: la nueva Guerra Fría en el Sahel y el Cuerno de África',
    summary: 'La expulsión de fuerzas francesas de Malí y Níger, la creciente presencia rusa a través del Grupo Wagner, y la expansión de bases militares chinas en Yibuti configuran un nuevo tablero geopolítico en África. Este análisis traza las líneas de fuerza y los intereses cruzados que definen la competencia por influencia en el continente.',
    fullContent: '',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-22T16:00:00Z',
    region: 'ÁFRICA',
    tags: ['Conflicto', 'Seguridad', 'Diplomacia'],
    readTime: 10,
    image: '/signals/sig-046.webp',
  },
  {
    id: 'ANL-005',
    title: 'Las dos Coreas, Taiwán y el Mar del Sur de China: los puntos calientes que podrían detonar una crisis global',
    summary: 'Mientras Occidente concentra su atención en Ucrania y Medio Oriente, tres focos de tensión en Asia-Pacífico se intensifican simultáneamente. El despliegue de armas nucleares tácticas por Corea del Norte, las elecciones en Taiwán y las patrullas conjuntas filipino-estadounidenses configuran un escenario de crisis multipunto sin precedentes.',
    fullContent: '',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-20T11:00:00Z',
    region: 'ASIA',
    tags: ['Conflicto', 'Seguridad', 'Diplomacia'],
    readTime: 11,
    image: '/signals/sig-042.webp',
  },
  {
    id: 'ANL-006',
    title: 'Energía y hegemonía: por qué la transición verde del Norte depende del Sur Global',
    summary: 'La narrativa occidental sobre la transición energética oculta una dependencia estructural: las baterías eléctricas, los paneles solares y los motores eólicos requieren minerales críticos que se extraen predominantemente en África, América Latina y Asia. Este análisis revela las asimetrías de poder en la cadena de suministro de la "economía verde".',
    fullContent: '',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-18T08:00:00Z',
    region: 'ÁFRICA',
    tags: ['Energía', 'Economía', 'Ecosistema'],
    readTime: 9,
    image: '/signals/sig-044.webp',
  },
];
