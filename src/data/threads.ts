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
      {
        threadId: 'thread-005',
        title: 'Guerra de agresión EE.UU.-Israel contra Irán',
        reason: 'Eje de Resistencia responde al ataque conjunto — Mar Rojo como teatro secundario',
        type: 'efecto',
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
      {
        threadId: 'thread-005',
        title: 'Guerra de agresión EE.UU.-Israel contra Irán',
        reason: 'Escalada directa del conflicto — de sanciones a operaciones militares',
        type: 'causa',
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
    regions: ['ASIA', 'LATINOAMÉRICA', 'ÁFRICA', 'MEDIO ORIENTE'],
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
    regions: ['LATINOAMÉRICA'],
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
  {
    id: 'thread-005',
    title: 'Guerra de agresión EE.UU.-Israel contra Irán',
    description: 'Ofensiva militar conjunta de Estados Unidos, Israel y aliados contra instalaciones estratégicas de Irán. El Eje de Resistencia (Hezbolá, Hamás, Houthis, milicias iraquíes) activa respuestas coordinadas. Conflicto armado directo con riesgo de conflagración regional y crisis energética global.',
    status: 'EN_VIVO',
    type: 'conflicto',
    regions: ['MEDIO ORIENTE', 'NORTEAMÉRICA', 'EUROPA', 'ASIA'],
    signals: [
      {
        id: 'ts-017',
        source: 'Al Jazeera',
        sourceCountry: 'QA',
        title: 'EE.UU. e Israel lanzan ofensiva aérea masiva contra instalaciones nucleares y militares de Irán',
        summary: 'Cientos de ataques aéreos alcanzaron instalaciones en Natanz, Arak, Bushehr y bases del Cuerpo de la Guardia Revolucionaria en Teherán, Isfahán y Bandar Abbás. El Pentágono confirmó "operaciones defensivas preventivas" mientras Israel declaró la destrucción del programa nuclear iraní. Irán reportó decenas de muertos entre personal civil y militar.',
        timestamp: '2026-04-27T02:15:00Z',
        relevance: 'CRÍTICA',
        tags: ['conflicto', 'ataque aéreo', 'nuclear'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-018',
        source: 'TeleSUR',
        sourceCountry: 'VE',
        title: 'Irán declara estado de guerra y convoca al Eje de Resistencia para respuesta coordinada',
        summary: 'El líder supremo Alí Jamenei decretó yihad defensiva y ordenó la movilización total del Eje de Resistencia. Hezbolá en Líbano, Hamás en Gaza, los Houthis en Yemen y las milicias Popular Mobilization Forces en Iraq recibieron directivas de acción coordinada contra intereses estadounidenses e israelíes en la región.',
        timestamp: '2026-04-27T04:00:00Z',
        relevance: 'CRÍTICA',
        tags: ['conflicto', 'Eje de Resistencia', 'respuesta militar'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-019',
        source: 'The Guardian',
        sourceCountry: 'GB',
        title: 'Reino Unido autoriza uso de bases en Chipre para operaciones contra Irán',
        summary: 'El gobierno británico confirmó que las bases RAF Akrotiri y Dhekelia en Chipre serán utilizadas para apoyo logístico y operaciones de la RAF como parte de la coalición liderada por EE.UU. La oposición laborista cuestionó la legalidad del despliegue sin autorización del Parlamento. Protestas masivas en Londres contra la participación británica.',
        timestamp: '2026-04-27T06:30:00Z',
        relevance: 'ALTA',
        tags: ['conflicto', 'alianzas', 'Chipre'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-020',
        source: 'Press TV',
        sourceCountry: 'IR',
        title: 'Irán lanza operación "Promesa Honesta" con 400 drones y misiles contra Israel',
        summary: 'El Cuerpo de la Guardia Revolucionaria ejecutó la operación con drones Shahed-136, misiles balísticos Emad y Ghadr, y misiles de crucero Paveh contra objetivos militares y de infraestructura energética en todo el territorio israelí. El sistema de defensa Iron Dome interceptó aproximadamente el 60% de los proyectiles. Impactos confirmados en bases aéreas de Nevatim y Ramat David.',
        timestamp: '2026-04-27T08:00:00Z',
        relevance: 'CRÍTICA',
        tags: ['conflicto', 'misiles', 'represalia'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-021',
        source: 'Reuters',
        sourceCountry: 'GB',
        title: 'Hezbolá dispara más de 1.000 cohetes contra el norte de Israel desde el sur del Líbano',
        summary: 'En la mayor ofensiva de Hezbolá desde octubre de 2023, la milicia libanesa lanzó oleadas de cohetes contra posiciones militares y ciudades del norte de Israel incluyendo Haifa y Safed. La artillería israelí respondió con bombardeos masivos en el sur del Líbano. Líbano reporta más de 200 muertos y 500.000 desplazados en 24 horas.',
        timestamp: '2026-04-27T09:30:00Z',
        relevance: 'CRÍTICA',
        tags: ['conflicto', 'Líbano', 'Hezbolá'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-022',
        source: 'Al Mayadeen',
        sourceCountry: 'LB',
        title: 'Milicias iraquíes atacan bases estadounidenses en Erbil y Bagdad',
        summary: 'Las Kataib Hezbollah y la red Harakat al-Nujaba ejecutaron ataques con drones suicidas contra la base aérea de Erbil y la embajada de EE.UU. en la Zona Verde de Bagdad. El ejército estadounidense confirmó bajas entre personal de la coalición. El primer ministro iraquí Mohamed Shia al-Sudani convocó sesión de emergencia del Parlamento para exigir la salida de tropas extranjeras.',
        timestamp: '2026-04-27T11:00:00Z',
        relevance: 'CRÍTICA',
        tags: ['conflicto', 'Iraq', 'bases militares'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-023',
        source: 'Middle East Eye',
        sourceCountry: 'GB',
        title: 'Houthis bloquean el Mar Rojo y atacan portaaviones USS Eisenhower con misil antibuque',
        summary: 'Ansar Allah (Houthis) declaró el cierre total del estrecho de Bab el-Mandeb al tráfico vinculado a Israel, EE.UU. y Reino Unido. Un misil antibuque C-802 impactó el destructor USS Gravely causando daños menores. Hundimiento confirmado del carguero MV Transworld Navigator con bandera liberiana que transportaba armamento hacia Israel.',
        timestamp: '2026-04-27T13:00:00Z',
        relevance: 'CRÍTICA',
        tags: ['conflicto', 'Mar Rojo', 'shipping'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-024',
        source: 'RT',
        sourceCountry: 'RU',
        title: 'Rusia y China exigen cesación inmediata en sesión de emergencia del Consejo de Seguridad de la ONU',
        summary: 'Ambos países vetaron una resolución estadounidense que justificaba las operaciones militares como "legítima defensa". El embajador ruso ante la ONU calificó el ataque de "agresión descarada" y anunció transferencia de armamento defensivo a Irán. China suspendió las negociaciones comerciales bilaterales con EE.UU. de forma indefinida.',
        timestamp: '2026-04-27T15:00:00Z',
        relevance: 'ALTA',
        tags: ['diplomacia', 'ONU', 'Rusia-China'],
        sourceLevel: 'B',
      },
      {
        id: 'ts-025',
        source: 'Financial Times',
        sourceCountry: 'GB',
        title: 'Petróleo supera los $150 por barril — mayor alza en 50 años',
        summary: 'El Brent saltó a $152/barril y el WTI a $148 tras el cierre efectivo del Estrecho de Ormuz. Irán amenazó con minar el estrecho si continúan los ataques. Aramco de Arabia Saudita redujo producción un 30% como medida precautoria. El pánico en los mercados disparó el VIX al nivel más alto desde 2008. Los países del G7 activaron planes de contingencia energética.',
        timestamp: '2026-04-27T17:30:00Z',
        relevance: 'CRÍTICA',
        tags: ['economía', 'energía', 'mercados'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-026',
        source: 'El País',
        sourceCountry: 'ES',
        title: 'Un millón de personas protestan en ciudades de todo el mundo contra la guerra',
        summary: 'Manifestaciones masivas en Madrid, Barcelona, Londres, Berlín, París, Estambul, Yakarta, Ciudad de México y Buenos Aires rechazaron la ofensiva militar contra Irán. En el mundo árabe, las protestas exigieron el cierre de embajadas estadounidenses. La UE permanece dividida: España e Italia piden diplomacia urgente mientras Alemania y Francia respaldan posiciones de la OTAN.',
        timestamp: '2026-04-27T19:00:00Z',
        relevance: 'ALTA',
        tags: ['derechos humanos', 'protestas', 'diplomacia'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-027',
        source: 'Nikkei Asia',
        sourceCountry: 'JP',
        title: 'Japón y Corea del Sur evalúan evacuación de ciudadanos en Medio Oriente',
        summary: 'Ambos gobiernos elevaron el nivel de alerta de viaje a "evacuación inmediata" para sus nacionales en Israel, Irán, Líbano e Iraq. Las aerolíneas japonesas y coreanas suspendieron todos los vuelos a la región. Japón anunció el despliegue de destructores de la Fuerza Marítima de Autodefensa hacia el Océano Índico para proteger rutas comerciales.',
        timestamp: '2026-04-27T20:30:00Z',
        relevance: 'ALTA',
        tags: ['seguridad', 'Asia', 'evacuación'],
        sourceLevel: 'A',
      },
      {
        id: 'ts-028',
        source: 'Al Jazeera',
        sourceCountry: 'QA',
        title: 'Irán informa destrucción masiva de infraestructura civil — hospitales y redes eléctricas fuera de servicio',
        summary: 'El Ministerio de Salud iraní reportó que al menos 14 hospitales en Teherán, Isfahán y Shiraz quedaron inoperativos tras los bombardeos. La red eléctrica nacional opera al 40% de capacidad. Más de 2.3 millones de personas carecen de agua potable. La Media Luna Roja pidió corredores humanitarios para la entrada de suministros médicos. El portavoz del Pentágono negó atacar objetivos civiles.',
        timestamp: '2026-04-28T06:00:00Z',
        relevance: 'CRÍTICA',
        tags: ['derechos humanos', 'infraestructura', 'crisis humanitaria'],
        sourceLevel: 'A',
      },
    ],
    relations: [
      {
        threadId: 'thread-001',
        title: 'Escalación en el Mar Rojo',
        reason: 'Houthis cierran Bab el-Mandeb como parte de la respuesta del Eje de Resistencia',
        type: 'efecto',
      },
      {
        threadId: 'thread-002',
        title: 'Tensión EE.UU.-Irán por programa nuclear',
        reason: 'Las sanciones y la escalada diplomática precedieron directamente la ofensiva militar',
        type: 'causa',
      },
      {
        threadId: 'thread-003',
        title: 'Cumbre del BRICS: nueva arquitectura financiera',
        reason: 'Guerra acelera la urgencia de sistemas de pago alternativos al dólar',
        type: 'correlacion',
      },
    ],
    tags: ['guerra de agresión', 'Eje de Resistencia', 'crisis energética', 'ataque aéreos', 'Estrecho de Ormuz', 'infraestructura civil'],
    sourceCount: 12,
    startedAt: '2026-04-27T02:15:00Z',
    lastActivityAt: '2026-04-28T06:00:00Z',
  },
];
