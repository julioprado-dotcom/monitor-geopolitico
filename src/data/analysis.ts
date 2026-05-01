import { type Region, type SourceLevel, type AccessLevel } from './signals';

export interface Analysis {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  author: string;
  authorRole: string;
  timestamp: string;
  region: Region;
  tags: string[];
  readTime: number; // minutos
  image?: string;
  sourceLevel: SourceLevel;
  verified: boolean;
  accessLevel: AccessLevel;
}

export const demoAnalysis: Analysis[] = [
  {
    id: 'ANL-001',
    title: 'La geopolítica del litio: por qué Bolivia, Chile y Argentina pueden redefinir el poder global',
    summary: 'El Triángulo del Litio concentra más del 60% de las reservas mundiales del mineral estratégico del siglo XXI. Sin embargo, las estrategias de explotación difieren radicalmente entre los tres países, reflejando modelos de desarrollo opuestos que determinarán su peso geopolítico frente a China y EE.UU. en la carrera por la transición energética.',
    fullContent: 'El Triángulo del Litio —formado por Bolivia, Chile y Argentina— concentra más del 60% de las reservas mundiales de litio, el mineral estratégico del siglo XXI esencial para la fabricación de baterías de vehículos eléctricos, almacenamiento de energía renovable y dispositivos electrónicos. Sin embargo, los tres países han adoptado modelos de explotación radicalmente distintos que revelan tensiones profundas entre soberanía nacional, inversión extranjera y justicia ambiental.',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-28T10:00:00Z',
    region: 'LATINOAMÉRICA',
    tags: ['Economía', 'Energía', 'Diplomacia'],
    readTime: 8,
    image: '/signals/sig-026.webp',
    sourceLevel: 'A',
    verified: true,
    accessLevel: 'ABIERTO',
  },
  {
    id: 'ANL-002',
    title: 'El eje multipolar BRICS+ y el fin del consenso de Washington: análisis estructural',
    summary: 'La expansión del BRICS a más de 10 miembros marca un punto de inflexión en la arquitectura financiera global. El nuevo Banco de Desarrollo no solo compite con el FMI y el Banco Mundial, sino que propone un paradigma de financiamiento sin condicionalidades políticas, desafiando directamente los mecanismos de control del Norte Global sobre las economías del Sur.',
    fullContent: 'La expansión del bloque BRICS a más de 10 miembros en 2024-2025 marca un punto de inflexión en la arquitectura financiera global. Lo que comenzó como un club de mercados emergentes (Brasil, Rusia, India, China, Sudáfrica) se ha transformado en una coalición geopolítica que abarca al 45% de la población mundial y al 35% del PIB global, desafiando directamente el monopolio institucional del Norte Global sobre la gobernanza económica.',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-26T14:00:00Z',
    region: 'LATINOAMÉRICA',
    tags: ['Diplomacia', 'Economía', 'Tecnología'],
    readTime: 12,
    image: '/signals/sig-026.webp',
    sourceLevel: 'A',
    verified: true,
    accessLevel: 'ABIERTO',
  },
  {
    id: 'ANL-003',
    title: 'Ciberseguridad soberana: cómo Cuba y Rusia construyen alternativas a la infraestructura digital occidental',
    summary: 'El despliegue de la red 5G cubana con tecnología conjunta China-Rusia no es un evento aislado. Es parte de una estrategia coordinada para construir infraestructura digital soberana que eluda el control de corporaciones estadounidenses y europeas. Este análisis examina las implicaciones para la soberanía digital del Sur Global.',
    fullContent: 'El despliegue de la red 5G cubana con tecnología conjunta China-Rusia no es un evento aislado en la infraestructura de telecomunicaciones del Caribe. Es la expresión tangible de una estrategia coordinada de construcción de soberanía digital que se extiende desde La Habana hasta Moscú y Pekín, y que tiene implicaciones que van mucho más allá del acceso a internet de alta velocidad.',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-24T09:00:00Z',
    region: 'LATINOAMÉRICA',
    tags: ['Tecnología', 'Seguridad', 'Diplomacia'],
    readTime: 7,
    image: '/signals/sig-033.webp',
    sourceLevel: 'A',
    verified: true,
    accessLevel: 'ABIERTO',
  },
  {
    id: 'ANL-004',
    title: 'África como laboratorio geopolítico: la nueva Guerra Fría en el Sahel y el Cuerno de África',
    summary: 'La expulsión de fuerzas francesas de Malí y Níger, la creciente presencia rusa a través del Grupo Wagner, y la expansión de bases militares chinas en Yibuti configuran un nuevo tablero geopolítico en África. Este análisis traza las líneas de fuerza y los intereses cruzados que definen la competencia por influencia en el continente.',
    fullContent: 'El continente africano se ha convertido en el principal teatro de la nueva competencia geopolítica global, un laboratorio donde se ensayan las dinámicas del orden multipolar emergente. La expulsión de fuerzas francesas de Malí (2021), Burkina Faso (2023) y Níger (2024), la creciente presencia militar rusa a través de Africa Corps (antes Grupo Wagner), y la expansión de bases militares chinas en Yibuti configuran un nuevo tablero que desafía las narrativas simplistas de la geopolítica convencional.',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-22T16:00:00Z',
    region: 'ÁFRICA',
    tags: ['Conflicto', 'Seguridad', 'Diplomacia'],
    readTime: 10,
    image: '/signals/sig-046.webp',
    sourceLevel: 'A',
    verified: true,
    accessLevel: 'ABIERTO',
  },
  {
    id: 'ANL-005',
    title: 'Las dos Coreas, Taiwán y el Mar del Sur de China: los puntos calientes que podrían detonar una crisis global',
    summary: 'Mientras Occidente concentra su atención en Ucrania y Medio Oriente, tres focos de tensión en Asia-Pacífico se intensifican simultáneamente. El despliegue de armas nucleares tácticas por Corea del Norte, las elecciones en Taiwán y las patrullas conjuntas filipino-estadounidenses configuran un escenario de crisis multipunto sin precedentes.',
    fullContent: 'Mientras la atención mundial se concentra en Ucrania y Medio Oriente, tres focos de tensión en Asia-Pacífico se intensifican simultáneamente, configurando un escenario de crisis multipunto sin precedentes en la era post-Guerra Fría. La particularidad de esta situación es que los tres focos están interconectados: un conflicto en cualquiera de ellos tendría efectos cascada inmediatos sobre los otros dos, y la capacidad de Washington de responder simultáneamente a tres crisis es incierta.',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-20T11:00:00Z',
    region: 'ASIA',
    tags: ['Conflicto', 'Seguridad', 'Diplomacia'],
    readTime: 11,
    image: '/signals/sig-042.webp',
    sourceLevel: 'A',
    verified: true,
    accessLevel: 'ABIERTO',
  },
  {
    id: 'ANL-006',
    title: 'Energía y hegemonía: por qué la transición verde del Norte depende del Sur Global',
    summary: 'La narrativa occidental sobre la transición energética oculta una dependencia estructural: las baterías eléctricas, los paneles solares y los motores eólicos requieren minerales críticos que se extraen predominantemente en África, América Latina y Asia. Este análisis revela las asimetrías de poder en la cadena de suministro de la "economía verde".',
    fullContent: 'La narrativa occidental sobre la transición energética presenta una imagen seductora pero engañosa: paneles solares brillantes, parques eólicos majestuosos y vehículos eléctricos silenciosos que reemplazarían progresivamente a los combustibles fósiles. Lo que esta narrativa oculta es una dependencia estructural tan profunda como la del petróleo en el siglo XX: las tecnologías limpias del Norte dependen de la extracción intensiva de minerales críticos del Sur Global, reproduciendo dinámicas extractivistas coloniales bajo un barniz de sostenibilidad.',
    author: 'Óptica Sur Global',
    authorRole: 'Equipo Editorial',
    timestamp: '2026-04-18T08:00:00Z',
    region: 'ÁFRICA',
    tags: ['Energía', 'Economía', 'Ecosistema'],
    readTime: 9,
    image: '/signals/sig-044.webp',
    sourceLevel: 'A',
    verified: true,
    accessLevel: 'ABIERTO',
  },
];
