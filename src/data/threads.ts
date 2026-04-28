// ── Modelo de Hilos de Eventos para el Explorador ──

export type ThreadStatus = 'EN_VIVO' | 'EVOLUCION' | 'RESUELTO' | 'DORMANTE';
export type ThreadType = 'conflicto' | 'diplomacia' | 'economia' | 'tecnologia' | 'seguridad' | 'derechos_humanos' | 'energia' | 'desastre';

export interface ThreadSignal {
  id: string;
  source: string;
  sourceCountry: string;
  title: string;
  summary: string;
  timestamp: string; // ISO
  relevance: 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  tags: string[];
  sourceLevel: 'A' | 'B' | 'C';
}

export interface ThreadRelation {
  threadId: string;
  title: string;
  reason: string;
  type: 'causa' | 'efecto' | 'correlacion';
}

export interface Thread {
  id: string;
  title: string;
  description: string;
  status: ThreadStatus;
  type: ThreadType;
  regions: string[];
  signals: ThreadSignal[];
  relations: ThreadRelation[];
  tags: string[];
  sourceCount: number;
  startedAt: string; // ISO
  lastActivityAt: string; // ISO
}

// ── Helpers ──

export const statusConfig: Record<ThreadStatus, { label: string; color: string; dotColor: string }> = {
  EN_VIVO: { label: 'En Vivo', color: '#EF4444', dotColor: 'bg-red-500' },
  EVOLUCION: { label: 'Evolución', color: '#F59E0B', dotColor: 'bg-amber-500' },
  RESUELTO: { label: 'Resuelto', color: '#00E5A0', dotColor: 'bg-emerald-400' },
  DORMANTE: { label: 'Dormante', color: '#64748B', dotColor: 'bg-slate-500' },
};

export const typeLabels: Record<ThreadType, string> = {
  conflicto: 'Conflicto',
  diplomacia: 'Diplomacia',
  economia: 'Economía',
  tecnologia: 'Tecnología',
  seguridad: 'Seguridad',
  derechos_humanos: 'Derechos Humanos',
  energia: 'Energía',
  desastre: 'Desastre',
};

// ── Datos Demo ──

export const demoThreads: Thread[] = [
  {
    id: 'thread-001',
    title: 'Escalación en el Mar Rojo',
    description: 'Serie de ataques a shipping comercial y respuesta militar multinacional que amenaza rutas globales de comercio.',
    status: 'EN_VIVO',
    type: 'conflicto',
    regions: ['MEDIO ORIENTE', 'EUROPA', 'ASIA'],
    signals: [
      {
        id: 'ts-001',
        source: 'Al Jazeera',
        sourceCountry: 'QA',
        title: 'Ataque con misiles a carguero en Bab el-Mandeb',
        summary: 'Fuentes yemeníes reportaron un ataque con misiles antibuque contra un carguero de bandera griega que transitaba el estrecho de Bab el-Mandeb. No hubo víctimas inmediatas reportadas.',
        timestamp: '2026-04-28T10:00:00Z',
        relevance: 'CRÍTICA',
        tags: ['conflicto', 'shipping'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-002',
        source: 'Reuters',
        sourceCountry: 'GB',
        title: 'EE.UU. despacha grupo de portaaviones al Mar Rojo',
        summary: 'El Pentágono confirmó el envío del grupo de batalla del USS Eisenhower para escoltar convoyes comerciales por el Mar Rojo tras el ataque aeronaval reportado esta mañana.',
        timestamp: '2026-04-28T12:30:00Z',
        relevance: 'ALTA',
        tags: ['seguridad', 'militar'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-003',
        source: 'TeleSUR',
        sourceCountry: 'VE',
        title: 'Yemen: respuesta proporcional ante agresión extranjera',
        summary: 'Desde Saná, voceros confirmaron que las operaciones en el Mar Rojo son respuesta directa a la intervención militar estadounidense en la región. Solicitaron diálogo diplomático previo.',
        timestamp: '2026-04-28T14:15:00Z',
        relevance: 'MEDIA',
        tags: ['diplomacia', 'conflicto'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-004',
        source: 'BBC World',
        sourceCountry: 'GB',
        title: 'Compañías navieras desvían rutas hacia el Cabo de Buena Esperanza',
        summary: 'Al menos 12 navieras internacionales anunciaron el desvío de sus rutas comerciales por el Mar Rojo hacia el Cabo, incrementando tiempos de tránsito entre Asia y Europa en 10-14 días.',
        timestamp: '2026-04-28T16:00:00Z',
        relevance: 'MEDIA',
        tags: ['economía', 'logística'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-005',
        source: 'Nikkei Asia',
        sourceCountry: 'JP',
        title: 'Costo de flete Asia-Europa se duplica por crisis del Mar Rojo',
        summary: 'El índice de flete containerizado Shanghai-Europa subió un 108% en las últimas 48 horas. Importadores asiáticos aceleran envíos antes de posible cierre del canal de Suez.',
        timestamp: '2026-04-28T18:45:00Z',
        relevance: 'ALTA',
        tags: ['economía', 'energía'],
        sourceLevel: 'A',
      },
    ],
    relations: [
      {
        threadId: 'thread-002',
        title: 'Tensión EE.UU.-Irán por programa nuclear',
        reason: 'Misma región, posible efecto cascada en energía global',
        type: 'correlacion',
      },
    ],
    tags: ['conflicto armado', 'cascada económica', 'riesgo logístico'],
    sourceCount: 5,
    startedAt: '2026-04-28T10:00:00Z',
    lastActivityAt: '2026-04-28T18:45:00Z',
  },
  {
    id: 'thread-002',
    title: 'Tensión EE.UU.-Irán por programa nuclear',
    description: 'Escalada diplomática y sanciones en torno al programa nuclear iraní, con impacto en mercados energéticos globales.',
    status: 'EVOLUCION',
    type: 'diplomacia',
    regions: ['NORTEAMÉRICA', 'MEDIO ORIENTE', 'ASIA'],
    signals: [
      {
        id: 'ts-006',
        source: 'The New York Times',
        sourceCountry: 'US',
        title: 'Biden impone nuevas sanciones al sector petrolero iraní',
        summary: 'La administración Biden firmó una orden ejecutiva que prohíbe la importación de petróleo iraní a terceros países que comercien con EE.UU., afectando a India y China como principales compradores.',
        timestamp: '2026-04-27T08:00:00Z',
        relevance: 'ALTA',
        tags: ['economía', 'sanciones'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-007',
        source: 'Press TV',
        sourceCountry: 'IR',
        title: 'Irán anuncia enriquecimiento de uranio al 90% en respuesta',
        summary: 'La Organización de Energía Atómica de Irán comunicó al OIEA que iniciará enriquecimiento al 90% en su planta de Natanz, calificando las sanciones como "acto de guerra económica".',
        timestamp: '2026-04-27T11:00:00Z',
        relevance: 'CRÍTICA',
        tags: ['seguridad', 'nuclear'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-008',
        source: 'Nikkei Asia',
        sourceCountry: 'JP',
        title: 'Crudo Brent sube 12% — mercados asiáticos en alerta',
        summary: 'El precio del Brent alcanzó los $102 por barril tras el anuncio iraní. Japón y Corea del Sur aceleran planes de diversificación energética y activan reservas estratégicas.',
        timestamp: '2026-04-27T15:00:00Z',
        relevance: 'ALTA',
        tags: ['economía', 'energía'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-009',
        source: 'Al Jazeera',
        sourceCountry: 'QA',
        title: 'Francia y Alemania proponen nueva ronda de negociaciones en Viena',
        summary: 'El E3 europeo envió un comunicado urgente proponiendo la reanudación del JCPOA sin condiciones previas. Rusia y China respaldaron la iniciativa. EE.UU. no se pronunció.',
        timestamp: '2026-04-28T09:00:00Z',
        relevance: 'MEDIA',
        tags: ['diplomacia', 'nuclear'],
        sourceLevel: 'A',
      },
    ],
    relations: [
      {
        threadId: 'thread-001',
        title: 'Escalación en el Mar Rojo',
        reason: 'Misma región, contexto de tensión geopolítica',
        type: 'correlacion',
      },
    ],
    tags: ['sanciones económicas', 'programa nuclear', 'mercados energéticos'],
    sourceCount: 4,
    startedAt: '2026-04-27T08:00:00Z',
    lastActivityAt: '2026-04-28T09:00:00Z',
  },
  {
    id: 'thread-003',
    title: 'Cumbre del BRICS: nueva arquitectura financiera',
    description: 'La expansión del BRICS y los avances hacia un sistema de pago alternativo al dominante generan reestructuración en el orden económico global.',
    status: 'EVOLUCION',
    type: 'economia',
    regions: ['ASIA', 'LATAM', 'ÁFRICA', 'MEDIO ORIENTE'],
    signals: [
      {
        id: 'ts-010',
        source: 'TeleSUR',
        sourceCountry: 'VE',
        title: 'BRICS+ anuncia sistema de pagos en monedas locales',
        summary: 'Los 11 miembros del bloque BRICS+ aprobaron la creación de una plataforma de liquidación de pagos en monedas locales para comercio bilateral, reduciendo dependencia del dólar.',
        timestamp: '2026-04-25T14:00:00Z',
        relevance: 'ALTA',
        tags: ['economía', 'diplomacia'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-011',
        source: 'RT',
        sourceCountry: 'RU',
        title: 'Russia y China avanzan en moneda de reserva BRICS',
        summary: 'Los bancos centrales de Rusia y China presentaron un borrador técnico para un activo de reserva respaldado por canasta de commodities y monedas del bloque BRICS.',
        timestamp: '2026-04-25T16:30:00Z',
        relevance: 'MEDIA',
        tags: ['economía', 'tecnología'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-012',
        source: 'Al Jazeera',
        sourceCountry: 'QA',
        title: 'Arabia Saudita evalúa unirse al sistema de pagos BRICS',
        summary: 'Funcionarios saudíes confirmaron que Riad está evaluando la adopción de la plataforma de pagos del BRICS para transacciones petroleras en yuanes y rupias.',
        timestamp: '2026-04-26T10:00:00Z',
        relevance: 'ALTA',
        tags: ['energía', 'economía'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-013',
        source: 'Financial Times',
        sourceCountry: 'GB',
        title: 'FMI advierte sobre fragmentación del sistema financiero global',
        summary: 'La directora del FMI expresó preocupación por la aceleración de sistemas de pago paralelos al SWIFT, advirtiendo que la fragmentación podría incrementar costos de transacción globales hasta un 3%.',
        timestamp: '2026-04-27T08:00:00Z',
        relevance: 'MEDIA',
        tags: ['economía', 'instituciones'],
        sourceLevel: 'A',
      },
    ],
    relations: [],
    tags: ['desdolarización', 'arquitectura financiera', 'comercio Sur-Sur'],
    sourceCount: 4,
    startedAt: '2026-04-25T14:00:00Z',
    lastActivityAt: '2026-04-27T08:00:00Z',
  },
  {
    id: 'thread-004',
    title: 'Crisis migratoria en la frontera Colombia-Panamá',
    description: 'Incremento sostenido de migrantes en el Darién con respuesta humanitaria insuficiente y tensión diplomática entre países de tránsito.',
    status: 'DORMANTE',
    type: 'derechos_humanos',
    regions: ['LATAM'],
    signals: [
      {
        id: 'ts-014',
        source: 'El País',
        sourceCountry: 'ES',
        title: 'OIM registra récord de 500.000 cruces por el Darién en 2026',
        summary: 'La Organización Internacional para las Migraciones informó que la cifra superó el récord anual con 4 meses restantes. Haití, Venezuela y Ecuador son los principales países de origen.',
        timestamp: '2026-04-20T09:00:00Z',
        relevance: 'ALTA',
        tags: ['derechos humanos', 'migración'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-015',
        source: 'TeleSUR',
        sourceCountry: 'VE',
        title: 'Panamá cuestiona financiación estadounidense para control migratorio',
        summary: 'El gobierno panameño rechazó las condiciones del acuerdo de cooperación con EE.UU. para el control del Darién, calificándolas de "injerencia en soberanía territorial".',
        timestamp: '2026-04-21T12:00:00Z',
        relevance: 'MEDIA',
        tags: ['diplomacia', 'soberanía'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-016',
        source: 'Reuters',
        sourceCountry: 'GB',
        title: 'ACNUR llama a crear corredores humanitarios en el Darién',
        summary: 'El Alto Comisionado de la ONU para los Refugiados propuso la creación de corredores seguros con apoyo de la Cruz Roja, después de reportarse 47 muertes en lo que va del año.',
        timestamp: '2026-04-22T14:00:00Z',
        relevance: 'ALTA',
        tags: ['derechos humanos', 'crisis humanitaria'],
        sourceLevel: 'A',
      },
    ],
    relations: [],
    tags: ['migración', 'derechos humanos', 'soberanía'],
    sourceCount: 3,
    startedAt: '2026-04-20T09:00:00Z',
    lastActivityAt: '2026-04-22T14:00:00Z',
  },
];
