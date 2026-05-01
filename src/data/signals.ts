export type Relevance = 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA' | 'INFORMATIVA';

export type Region = 'LATAM' | 'EUROPA' | 'ASIA' | 'ÁFRICA' | 'MEDIO ORIENTE' | 'NORTEAMÉRICA';

export type SourceLevel = 'A' | 'B' | 'C' | 'D';

export type AccessLevel = 'ABIERTO' | 'RESTRINGIDO' | 'CLASIFICADO';

export type UserTier = 'gratuito' | 'premium' | 'profesional' | 'institucional';

export interface Signal {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  region: Region;
  classifiers: string[];
  relevance: Relevance;
  source: string;
  sourceUrl: string;
  language: string;
  timestamp: string;
  verified: boolean;
  sourceLevel: SourceLevel;
  accessLevel: AccessLevel;
  image?: string;
}

export const relevanceColors: Record<Relevance, string> = {
  'CRÍTICA': '#EF4444',
  'ALTA': '#F97316',
  'MEDIA': '#EAB308',
  'BAJA': '#22C55E',
  'INFORMATIVA': '#38BDF8',
};

export const sourceLevelLabels: Record<SourceLevel, string> = {
  'A': 'Referencial',
  'B': 'Complementaria',
  'C': 'Contrastiva',
  'D': 'Vigilada',
};

export const sourceLevelDescriptions: Record<SourceLevel, string> = {
  'A': 'Fuente con alta honestidad periodística, sesgo predecible y declarado, cobertura amplia del Sur Global.',
  'B': 'Fuente valiosa con honestidad aceptable pero sesgos más variables o cobertura limitada. Requiere contextualización.',
  'C': 'Fuente con honestidad cuestionable en ciertos temas o línea editorial oculta. Útil para contrastar perspectivas.',
  'D': 'Fuente con patrón recurrente de desinformación verificable. Se muestra para vigilancia de narrativas.',
};

export const sourceLevelColors: Record<SourceLevel, { bg: string; text: string; border: string }> = {
  'A': { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', border: 'rgba(34,197,94,0.3)' },
  'B': { bg: 'rgba(234,179,8,0.15)', text: '#EAB308', border: 'rgba(234,179,8,0.3)' },
  'C': { bg: 'rgba(249,115,22,0.15)', text: '#F97316', border: 'rgba(249,115,22,0.3)' },
  'D': { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', border: 'rgba(239,68,68,0.3)' },
};

export const accessLevelLabels: Record<AccessLevel, string> = {
  'ABIERTO': 'Acceso público sin restricciones',
  'RESTRINGIDO': 'Acceso limitado o parcial',
  'CLASIFICADO': 'Información reservada filtrada',
};

// ── Niveles de usuario y límites de acceso ──

export const userTierConfig: Record<UserTier, {
  label: string;
  maxAnalysesPerDay: number;
  maxComparisonsPerDay: number;
  historyDays: number;
  accessLevelD: boolean;
  shareBranding: boolean;
  color: string;
}> = {
  'gratuito': {
    label: 'Gratuito',
    maxAnalysesPerDay: 5,
    maxComparisonsPerDay: 2,
    historyDays: 30,
    accessLevelD: false,
    shareBranding: true,
    color: '#38BDF8',
  },
  'premium': {
    label: 'Premium',
    maxAnalysesPerDay: -1, // ilimitado
    maxComparisonsPerDay: 10,
    historyDays: 365,
    accessLevelD: false,
    shareBranding: false,
    color: '#00E5A0',
  },
  'profesional': {
    label: 'Profesional',
    maxAnalysesPerDay: 200,
    maxComparisonsPerDay: 50,
    historyDays: -1, // ilimitado
    accessLevelD: true,
    shareBranding: false,
    color: '#A78BFA',
  },
  'institucional': {
    label: 'Institucional',
    maxAnalysesPerDay: -1, // ilimitado
    maxComparisonsPerDay: -1, // ilimitado
    historyDays: -1, // ilimitado
    accessLevelD: true,
    shareBranding: false,
    color: '#F472B6',
  },
};

// ── Disclaimer legal ──

// ── Etiquetas de región para UI (mapea el valor técnico al nombre visible) ──

export const regionLabels: Record<Region, string> = {
  'LATAM': 'Latinoamérica',
  'EUROPA': 'Europa',
  'ASIA': 'Asia-Pacífico',
  'ÁFRICA': 'África',
  'MEDIO ORIENTE': 'Medio Oriente',
  'NORTEAMÉRICA': 'Norteamérica',
};

// ── Disclaimer legal ──

export const DISCLAIMER = 'Monitor Geopolítico es una plataforma de análisis e investigación geopolítica. Los artículos y contenido original pertenecen a sus fuentes. El análisis geopolítico generado por el Monitor — Óptica Sur Global, con filtros analíticos y bidireccionalidad de relevancia — es contenido original del Monitor Geopolítico - Newsconnect';

export const SHARE_FOOTER_FREE = '\n\nAnálisis por Monitor Geopolítico — monitor-geopolitico.com';

// ── Mapa de fuente → bandera + código de país ──

export const sourceCountry: Record<string, { flag: string; code: string }> = {
  'Agencia BRICS de Noticias': { flag: '🌐', code: 'BRICS' },
  'Al Jazeera': { flag: '🇶🇦', code: 'QAT' },
  'Xinhua': { flag: '🇨🇳', code: 'CHN' },
  'Reuters África': { flag: '🇬🇧', code: 'GBR' },
  'EFE': { flag: '🇪🇸', code: 'ESP' },
  'The Hindu': { flag: '🇮🇳', code: 'IND' },
  'BBC África': { flag: '🇬🇧', code: 'GBR' },
  'TASS': { flag: '🇷🇺', code: 'RUS' },
  'Africa News': { flag: '🇦🇫', code: 'AFR' },
  'Folha de São Paulo': { flag: '🇧🇷', code: 'BRA' },
  'Middle East Eye': { flag: '🇬🇧', code: 'GBR' },
  'The East African': { flag: '🇰🇪', code: 'KEN' },
  'Euractiv': { flag: '🇪🇺', code: 'EUR' },
  'La Jornada': { flag: '🇲🇽', code: 'MEX' },
  'Africa Renewal': { flag: '🇺🇳', code: 'ONU' },
  'Washington Post': { flag: '🇺🇸', code: 'USA' },
  'OHCHR': { flag: '🇺🇳', code: 'ONU' },
  'Telesur': { flag: '🇻🇪', code: 'VEN' },
  'The National': { flag: '🇦🇪', code: 'EAU' },
  'Nordic Monitor': { flag: '🇸🇪', code: 'SWE' },
  'Página/12': { flag: '🇦🇷', code: 'ARG' },
  'Irrawaddy': { flag: '🇲🇲', code: 'MMR' },
  'Mongabay Latam': { flag: '🇵🇪', code: 'PER' },
  'Le Monde Diplomatique': { flag: '🇫🇷', code: 'FRA' },
  'MNOAL Official': { flag: '🇺🇳', code: 'ONU' },
  'CBC News': { flag: '🇨🇦', code: 'CAN' },
  'Anadolu Agency': { flag: '🇹🇷', code: 'TUR' },
  'CIJ Official': { flag: '🇳🇱', code: 'NLD' },
  'Prensa Latina': { flag: '🇨🇺', code: 'CUB' },
  'RT': { flag: '🇷🇺', code: 'RUS' },
  'TRT World': { flag: '🇹🇷', code: 'TUR' },
  'CGTN': { flag: '🇨🇳', code: 'CHN' },
};

export const demoSignals: Signal[] = [
  {
    id: 'SIG-2025-001',
    title: 'Cumbre BRICS+ acuerda mecanismo de pagos alternativo al dólar',
    summary: 'Los líderes del bloque BRICS+ anunciaron la creación de un sistema de pagos transfronterizos que elude al dólar estadounidense, marcando un hito en la desdolarización global.',
    fullContent: `Los líderes de los diez países miembros del bloque BRICS+ — Brasil, Rusia, India, China, Sudáfrica, más los nuevos miembros: Arabia Saudita, Emiratos Árabes Unidos, Irán, Egipto y Etiopía — anunciaron la creación del Sistema de Pagos Transfronterizos BRICS (SPT-BRICS), un mecanismo que utiliza tecnología blockchain y una moneda de reserva canasta basada en los tipos de cambio de las monedas miembros.

El sistema busca eliminar la dependencia del dólar estadounidense en el comercio bilateral entre los países del bloque, que representa el 35% del PIB mundial y el 45% de la población global. Según el Banco Central de Brasil, el volumen de comercio intra-BRICS alcanzó los 4.8 billones de dólares en 2024, con una proyección de crecimiento del 18% anual.

La Reserva Federal de EE.UU. expresó su preocupación por el impacto potencial en la hegemonía del dólar como moneda de reserva global. Los países del Sur Global ven en esta iniciativa una herramienta de soberanía financiera y una alternativa al sistema de pagos dominado por occidente, que ha utilizado el control del SWIFT como instrumento de presión geopolítica.`,
    region: 'LATAM',
    classifiers: ['Economía', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'Agencia BRICS de Noticias',
    sourceUrl: 'https://example.com/brics-pay',
    language: 'es',
    timestamp: '2025-12-15T14:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-001.webp'
  },
  {
    id: 'SIG-2025-002',
    title: 'Tensiones en el Estrecho de Ormuz: Irán amenaza con cierre naval',
    summary: 'El comandante de la Guardia Revolucionaria iraní advirtió sobre el posible cierre del Estrecho de Ormuz en respuesta a nuevas sanciones occidentales, elevando el riesgo de un conflicto regional.',
    fullContent: `El comandante de la Guardia Revolucionaria Iraní, el general Hossein Salami, declaró en Teherán que Irán tiene la capacidad operativa de cerrar el Estrecho de Ormuz en un plazo de 48 horas si las nuevas sanciones occidentales no son levantadas. El Estrecho de Ormuz es un corredor marítimo por el que transita aproximadamente el 20% del petróleo mundial y el 35% del petróleo comercializado por mar.

Las sanciones, anunciadas la semana pasada por la Unión Europea y reforzadas por la administración estadounidense, apuntan al sector petroquímico iraní y a las empresas vinculadas al programa de drones del país. Teherán las calificó de violación flagrante del derecho internacional y acto de guerra económica.

El Departamento de Defensa de EE.UU. elevó el nivel de alerta de sus fuerzas en la región, desplazando un grupo de portaaviones adicionales al Golfo Pérsico. China, principal comprador de petróleo iraní, instó a la moderación y el diálogo, mientras Rusia respaldó el derecho iraní a defender su soberanía económica. Los precios del petróleo Brent saltaron un 12% en las últimas 48 horas.`,
    region: 'MEDIO ORIENTE',
    classifiers: ['Conflicto', 'Energía'],
    relevance: 'CRÍTICA',
    source: 'Al Jazeera',
    sourceUrl: 'https://example.com/ormuz-tension',
    language: 'es',
    timestamp: '2025-12-14T09:15:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-003',
    title: 'China lanza satélite de comunicación cuántica para red segura global',
    summary: 'El lanzamiento del satélite QSS-3 marca un avance significativo en las comunicaciones cuánticas, con implicaciones para la ciberseguridad y la soberanía digital de las naciones aliadas.',
    fullContent: `El satélite QSS-3 (Quantum Secure Satellite-3), lanzado desde el Centro de Lanzamiento de Satélites de Jiuquan, representa la tercera generación de satélites de comunicación cuántica de China y el primero diseñado para establecer enlaces con estaciones terrestres en países socios del Sur Global.

A diferencia de los satélites anteriores Micius (2016) y Jinan-1 (2022), el QSS-3 utiliza una nueva tecnología de distribución de claves cuánticas (QKD) de largo alcance capaz de operar tanto de día como de noche, superando una de las principales limitaciones técnicas de los sistemas anteriores.

Estados Unidos considera que el avance cuántico chino amenaza la capacidad de interceptación de comunicaciones de la NSA y la CIA. La OTAN ha acelerado su propio programa cuántico, con una inversión de 3.200 millones de euros. Sin embargo, expertos de la Academia China de Ciencias señalan que el sistema QSS-3 tiene al menos tres años de ventaja sobre los esfuerzos occidentales equivalentes.`,
    region: 'ASIA',
    classifiers: ['Tecnología', 'Seguridad'],
    relevance: 'ALTA',
    source: 'Xinhua',
    sourceUrl: 'https://example.com/quantum-sat',
    language: 'es',
    timestamp: '2025-12-13T22:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-003.webp'
  },
  {
    id: 'SIG-2025-004',
    title: 'Golpe de estado en Níger: junta militar disuelve instituciones',
    summary: 'La junta militar de Níger disolvió todas las instituciones democráticas y suspendió la constitución, generando condenas internacionales y un vacío de poder en la región del Sahel.',
    fullContent: `El general Abdourahamane Tchiani, líder de la junta militar que tomó el poder en Níger, emitió un decreto disolviendo la Asamblea Nacional, el Tribunal Constitucional y todas las instituciones democráticas del país. La decisión genera un vacío de poder total en la región del Sahel.

La CEDEAO condenó la medida y suspendió inmediatamente a Níger. La Unión Africana activó su mecanismo de respuesta a crisis constitucionales. Francia retiró a sus 1.500 soldados estacionados en el país. Malí y Burkina Faso, ambos bajo gobiernos militares, expresaron su apoyo solidario a la junta nigeriana.

Los tres países forman ahora una franja de gobiernos militares que controla el corazón del Sahel, con implicaciones directas para la lucha contra el terrorismo yihadista y la influencia geopolítica de Francia, Rusia y China en la región.`,
    region: 'ÁFRICA',
    classifiers: ['Conflicto', 'Economía', 'Derechos Humanos'],
    relevance: 'CRÍTICA',
    source: 'Reuters África',
    sourceUrl: 'https://example.com/niger-coup',
    language: 'es',
    timestamp: '2025-12-13T16:45:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-004.webp'
  },
  {
    id: 'SIG-2025-005',
    title: 'Mercosur y UE alcanzan acuerdo comercial tras 25 años de negociaciones',
    summary: 'Tras dos décadas y media de negociaciones, el Mercosur y la Unión Europea firmaron un acuerdo comercial que cubre a más de 780 millones de personas, el mayor en la historia de ambos bloques.',
    fullContent: `Tras 25 años de negociaciones, el Mercosur y la Unión Europea firmaron el acuerdo comercial más ambicioso en la historia de ambos bloques, cubriendo una zona de libre comercio que abarca a más de 780 millones de personas.

El acuerdo elimina aranceles al 90% de los productos europeos exportados al Mercosur y al 82% de los productos sudamericanos exportados a la UE. Se estima que el acuerdo podría incrementar el comercio bilateral en 40.000 millones de dólares anuales.

Sin embargo, el acuerdo enfrenta oposición significativa. En Europa, productores agrícolas de Francia, Polonia e Irlanda temen una invasión de productos baratos. En América Latina, organizaciones ambientalistas advierten que el acuerdo profundizará la deforestación amazónica y precarizará las condiciones laborales.`,
    region: 'LATAM',
    classifiers: ['Diplomacia', 'Economía'],
    relevance: 'MEDIA',
    source: 'EFE',
    sourceUrl: 'https://example.com/mercosur-ue',
    language: 'es',
    timestamp: '2025-12-12T11:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-006',
    title: 'India supera a China como país más poblado: implicaciones geopolíticas',
    summary: 'La ONU confirmó que India alcanzó los 1.428 millones de habitantes, superando a China. Este cambio demográfico tiene profundas implicaciones para la geopolítica asiática y la economía global.',
    fullContent: `La ONU confirmó que India ha superado oficialmente a China como el país más poblado del mundo, con 1.428 millones de habitantes frente a los 1.425 millones de China. Este hito demográfico marca un punto de inflexión en la historia moderna de Asia.

India experimenta un dividendo demográfico favorable: el 65% de su población tiene menos de 35 años, mientras que China enfrenta un envejecimiento acelerado. Esta ventaja demográfica posiciona a India como el principal competidor de China en la manufactura global y los servicios tecnológicos.

Sin embargo, el crecimiento demográfico indio presenta desafíos: la necesidad de crear 12 millones de empleos anuales, la presión sobre recursos hídricos y la tensión social derivada de la desigualdad de ingresos.`,
    region: 'ASIA',
    classifiers: ['Diplomacia', 'Economía'],
    relevance: 'MEDIA',
    source: 'The Hindu',
    sourceUrl: 'https://example.com/india-population',
    language: 'es',
    timestamp: '2025-12-12T08:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-006.webp'
  },
  {
    id: 'SIG-2025-007',
    title: 'Crisis del agua en el Nilo: Etiopía y Egipto al borde del conflicto',
    summary: 'El llenado de la Gran Presa Renacentista de Etiopía ha elevado las tensiones con Egipto a niveles sin precedentes, con amenazas de acción militar sobre el control del Nilo.',
    fullContent: `El llenado de la Gran Presa Renacentista (GDR) de Etiopía ha elevado las tensiones entre Etiopía y Egipto a niveles sin precedentes. El presidente egipcio el-Sisi advirtió que todas las opciones están sobre la mesa para proteger el acceso al Nilo, que aporta el 90% del agua dulce de Egipto.

Etiopía rechaza cualquier injerencia externa, considerando el proyecto fundamental para electrificar al 60% de su población sin acceso a la red eléctrica. El primer ministro Abiy Ahmed calificó la posición egipcia de neocolonial.

Sudán ha tomado una posición ambivalente, recibiendo ofertas de ambos lados. Expertos de la ONU advierten que un conflicto por el agua podría generar una crisis humanitaria que afecte a más de 300 millones de personas.`,
    region: 'ÁFRICA',
    classifiers: ['Ecosistema', 'Seguridad', 'Conflicto'],
    relevance: 'CRÍTICA',
    source: 'BBC África',
    sourceUrl: 'https://example.com/nile-crisis',
    language: 'es',
    timestamp: '2025-12-11T19:20:00Z',
    verified: false,
    sourceLevel: 'C',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-008',
    title: 'Rusia despliega misiles hipersónicos en Kaliningrado',
    summary: 'El despliegue de misiles hipersónicos Avangard en la región de Kaliningrado representa una escalada significativa en la confrontación estratégica entre Rusia y la OTAN.',
    fullContent: `Rusia anunció el despliegue operativo de misiles hipersónicos Avangard en la región de Kaliningrado. Los misiles, capaces de alcanzar velocidades de Mach 27 y maniobrar en vuelo para evadir defensas antimisiles, representan la punta de lanza del arsenal estratégico ruso.

La OTAN calificó el despliegue de escalada inaceptable y amenaza directa a la seguridad de todos los miembros de la alianza. El secretario general anunció refuerzo de defensas en los países bálticos y baterías Patriot adicionales en Polonia y Rumania.

El Kremlin justificó la medida como respuesta simétrica al aumento de presencia militar de la OTAN en Europa del Este. Kaliningrado ha sido convertida en una fortaleza militar con capacidad nuclear táctica, modificando el equilibrio estratégico en el Báltico.`,
    region: 'EUROPA',
    classifiers: ['Seguridad', 'Conflicto'],
    relevance: 'CRÍTICA',
    source: 'TASS',
    sourceUrl: 'https://example.com/kaliningrad-missiles',
    language: 'es',
    timestamp: '2025-12-11T14:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'RESTRINGIDO',
    image: '/signals/sig-008.webp'
  },
  {
    id: 'SIG-2025-009',
    title: 'Acuerdo minero entre República Democrática del Congo y China por cobalto',
    summary: 'Un nuevo acuerdo entre la RDC y China por los derechos mineros de cobalto reconfigura la cadena de suministro global de baterías eléctricas, con implicaciones para la transición energética mundial.',
    fullContent: `La RDC y China firmaron un acuerdo minero de 10 años por la explotación de cobalto en Lualaba, valorado en 15.000 millones de dólares. El cobalto es esencial para baterías de ion-litio, vehículos eléctricos y almacenamiento de energía renovable. La RDC posee el 70% de las reservas mundiales y China controla el 80% del refinado global.

Amnistía Internacional documentó condiciones laborales inaceptables, incluyendo trabajo infantil y exposición a metales tóxicos. El presidente Tshisekedi prometió cláusulas de responsabilidad social más estrictas, pero activistas locales expresan escepticismo.`,
    region: 'ÁFRICA',
    classifiers: ['Economía', 'Derechos Humanos', 'Energía'],
    relevance: 'ALTA',
    source: 'Africa News',
    sourceUrl: 'https://example.com/drc-china-cobalt',
    language: 'es',
    timestamp: '2025-12-10T20:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-009.webp'
  },
  {
    id: 'SIG-2025-010',
    title: 'Nueva ley de soberanía digital en Brasil impacta a Big Tech',
    summary: 'Brasil aprobó la Ley de Soberanía Digital que exige a las empresas tecnológicas almacenar datos de usuarios brasileños dentro del territorio nacional y pagar compensación por uso de datos.',
    fullContent: `El Congreso Nacional de Brasil aprobó la Ley de Soberanía Digital con 312 votos a favor y 148 en contra, exigiendo que Meta, Google, Amazon, Microsoft y TikTok almacenen datos de usuarios brasileños dentro del territorio y paguen compensación por uso de datos personales.

La ley establece multas de hasta el 10% de la facturación global para empresas que incumplan. Crea un Ente Regulador de Datos con poder para auditar algoritmos y exigir transparencia en moderación de contenido.

Las empresas tecnológicas estadounidenses calificaron la ley de discriminatoria. La Unión Europea e India expresaron interés en adoptar modelos similares, señalando un cambio de paradigma global en la gobernanza de datos tecnológicos.`,
    region: 'LATAM',
    classifiers: ['Tecnología', 'Economía', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'Folha de São Paulo',
    sourceUrl: 'https://example.com/brazil-digital-law',
    language: 'es',
    timestamp: '2025-12-10T15:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-010.webp'
  },
  {
    id: 'SIG-2025-011',
    title: 'Arabia Saudita y Irán reanudan relaciones diplomáticas: impactos regionales',
    summary: 'El restablecimiento de relaciones entre Riad y Teherán, mediado por China, continúa generando realineamientos en el tablero geopolítico de Medio Oriente.',
    fullContent: `El restablecimiento de relaciones diplomáticas entre Arabia Saudita e Irán, mediado por China, genera transformaciones profundas en Medio Oriente. Riad reabrió su embajada en Teherán y ambos países establecieron canales de comunicación militar directa.

Arabia Saudita ha comenzado a desvincular su política exterior de la alineación automática con Washington, especialmente en la cuestión palestina. El acuerdo incluye inversiones chinas de 50.000 millones de dólares en infraestructura.

Para Israel, el acercamiento saudí-iraní representa un revés estratégico que complica sus planes de normalización con Riad y altera el equilibrio de poder regional.`,
    region: 'MEDIO ORIENTE',
    classifiers: ['Diplomacia', 'Seguridad'],
    relevance: 'ALTA',
    source: 'Middle East Eye',
    sourceUrl: 'https://example.com/saudi-iran-relations',
    language: 'es',
    timestamp: '2025-12-09T12:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-012',
    title: 'Protestas masivas en Kenia contra acuerdo económico con China',
    summary: 'Miles de kenyans salieron a las calles para protestar contra el acuerdo de asociación económica con China, argumentando que reproduce patrones de dependencia neocolonial.',
    fullContent: `Miles de kenyans se manifestaron contra el Acuerdo de Asociación Económica firmado con China, argumentando que reproduce patrones de dependencia neocolonial y beneficia desproporcionadamente a empresas chinas.

El acuerdo facilita la entrada de productos manufacturados chinos a cambio de acceso a recursos naturales. Los manifestantes señalan que la diplomacia de infraestructura china ha dejado a países africanos endeudados sin beneficios prometidos.

Analistas del Instituto Africano de Política Económica advierten que el comercio bilateral es cada vez más asimétrico: Kenia exporta materias primas mientras importa productos manufacturados, perpetuando una relación colonial.`,
    region: 'ÁFRICA',
    classifiers: ['Economía', 'Derechos Humanos', 'Conflicto'],
    relevance: 'ALTA',
    source: 'The East African',
    sourceUrl: 'https://example.com/kenya-protests',
    language: 'es',
    timestamp: '2025-12-09T09:45:00Z',
    verified: false,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-013',
    title: 'UE aprueba regulación de IA: impacto en ecosistemas tecnológicos emergentes',
    summary: 'La Unión Europea aprobó la primera ley integral de inteligencia artificial del mundo, estableciendo un precedente regulatorio que afectará a desarrolladores y empresas de todo el mundo.',
    fullContent: `El Parlamento Europeo aprobó la Ley de Inteligencia Artificial (AI Act), la primera regulación integral de IA en el mundo. La ley establece un sistema de clasificación por riesgos: riesgo inaceptable (prohibidas), riesgo alto (reguladas estrictamente), riesgo limitado (transparencia) y riesgo mínimo.

Las aplicaciones prohibidas incluyen sistemas de puntuación social, manipulación subliminal, biometría masiva en tiempo real y predicción policial basada en perfiles étnicos.

Startups francesas y alemanas temen que la regulación asfixie la innovación. Sin embargo, Brasil, India y Sudáfrica han expresado interés en adoptar modelos similares, estableciendo a Europa como estándar global de gobernanza de IA.`,
    region: 'EUROPA',
    classifiers: ['Tecnología', 'Diplomacia'],
    relevance: 'MEDIA',
    source: 'Euractiv',
    sourceUrl: 'https://example.com/eu-ai-act',
    language: 'es',
    timestamp: '2025-12-08T17:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-013.webp'
  },
  {
    id: 'SIG-2025-014',
    title: 'México nacionaliza litio: implicaciones para la cadena de suministro global',
    summary: 'La nacionalización del litio en México reconfigura el acceso a uno de los minerales más estratégicos del siglo XXI, con impacto directo en la transición energética mundial.',
    fullContent: `La presidenta de México firmó el decreto de nacionalización del litio, creando la Empresa Nacional del Litio (LitioMx). México posee reservas estimadas de 1.7 millones de toneladas, esenciales para la transición energética global.

La medida generó fricciones con corporaciones canadienses, chinas y surcoreanas. Bolivia y Argentina, los otros dos países del triángulo del litio, han mostrado interés en coordinar políticas de soberanía sobre el mineral.

China, principal consumidor mundial de litio, expresó preocupación por la medida. Estados Unidos evalúa recurrir a mecanismos de disputa del USMCA para proteger las inversiones de sus empresas en el sector.`,
    region: 'LATAM',
    classifiers: ['Economía', 'Energía', 'Derechos Humanos'],
    relevance: 'ALTA',
    source: 'La Jornada',
    sourceUrl: 'https://example.com/mexico-lithium',
    language: 'es',
    timestamp: '2025-12-08T10:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-015',
    title: 'Cumbre del África sobre cambio climático: demanda de reparaciones',
    summary: 'Los líderes africanos exigieron compensaciones climáticas de 500 mil millones de dólares anuales, señalando que el continente sufre desproporcionadamente las consecuencias de emisiones que no generó.',
    fullContent: `En la Cumbre del Clima de África en Nairobi, los 54 países del continente exigieron compensaciones climáticas de 500.000 millones de dólares anuales. África contribuye con menos del 4% de las emisiones globales pero sufre desproporcionadamente sus consecuencias.

La declaración establece que las compensaciones deben considerarse reparaciones por daños causados por más de un siglo de emisiones industriales occidentales, no ayuda humanitaria.

La UE y EE.UU. rechazaron la cifra, ofreciendo 100.000 millones anuales. China respaldó la posición africana y se comprometió a contribuir con 30.000 millones anuales a través del Banco de los BRICS.`,
    region: 'ÁFRICA',
    classifiers: ['Ecosistema', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'Africa Renewal',
    sourceUrl: 'https://example.com/africa-climate-summit',
    language: 'es',
    timestamp: '2025-12-07T13:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-015.webp'
  },
  {
    id: 'SIG-2025-016',
    title: 'EEUU impone nuevas restricciones a exportaciones de chips a China',
    summary: 'Nuevas restricciones estadounidenses sobre la exportación de semiconductores avanzados a China escalan la guerra tecnológica entre ambas potencias con efectos en la cadena global.',
    fullContent: `El Departamento de Comercio de EE.UU. anunció nuevas restricciones a la exportación de semiconductores avanzados a China, prohibiendo la venta de chips de 7nm o menos y equipos de litografía avanzada.

La medida afecta a SMIC y Huawei. Se estima que podría retrasar la industria de semiconductores china entre tres y cinco años. China amenazó con restricciones a la exportación de galio, germanio y tierras raras.

Empresas de Corea del Sur, Japón y Taiwán se encuentran atrapadas entre las presiones de Washington y su dependencia del mercado chino.`,
    region: 'NORTEAMÉRICA',
    classifiers: ['Tecnología', 'Seguridad'],
    relevance: 'ALTA',
    source: 'Washington Post',
    sourceUrl: 'https://example.com/us-china-chips',
    language: 'es',
    timestamp: '2025-12-07T08:00:00Z',
    verified: true,
    sourceLevel: 'C',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-017',
    title: 'Derechos humanos en Xinjiang: nuevo informe de la ONU genera tensiones',
    summary: 'Un nuevo informe de la ONU documenta violaciones sistemáticas de derechos humanos en Xinjiang, generando tensiones diplomáticas entre Occidente y China.',
    fullContent: `La OHCHR publicó un informe de 120 páginas documentando violaciones sistemáticas de derechos humanos en Xinjiang. El informe detalla centros de detención con entre 200.000 y un millón de personas, principalmente uigures, y políticas de asimilación forzada.

China rechazó el informe, calificándolo de falso y manipulado por fuerzas anti-chinas. La cuestión generó nuevas tensiones diplomáticas, con la UE pidiendo sanciones y China amenazando con represalias económicas.`,
    region: 'ASIA',
    classifiers: ['Derechos Humanos', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'OHCHR',
    sourceUrl: 'https://example.com/xinjiang-report',
    language: 'es',
    timestamp: '2025-12-06T16:00:00Z',
    verified: true,
    sourceLevel: 'A',
    accessLevel: 'RESTRINGIDO',
    image: '/signals/sig-017.webp'
  },
  {
    id: 'SIG-2025-018',
    title: 'Venezuela y Guyana: disputa territorial por la región del Esequibo se intensifica',
    summary: 'La disputa territorial entre Venezuela y Guyana por la región del Esequibo se ha intensificado tras el descubrimiento de nuevos yacimientos petroleros en aguas disputadas.',
    fullContent: `La disputa territorial entre Venezuela y Guyana por el Esequibo se intensificó tras el descubrimiento de 3.000 millones de barriles adicionales de crudo en aguas disputadas. ExxonMobil opera bajo licencia de Guyana.

Maduro convocó un referéndum donde, según resultados oficiales cuestionados, el 95% votó a favor de reclamar la soberanía. CARICOM respaldó la posición guyanesa de resolver la disputa mediante la CIJ.

Brasil reforzó su presencia militar en la frontera norte. EE.UU. aumentó ejercicios militares con Guyana, mientras Rusia expresó apoyo al derecho venezolano de defender su soberanía territorial.`,
    region: 'LATAM',
    classifiers: ['Conflicto', 'Energía', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'Telesur',
    sourceUrl: 'https://example.com/venezuela-guyana',
    language: 'es',
    timestamp: '2025-12-06T11:30:00Z',
    verified: false,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-019',
    title: 'Transición energética en el Golfo: Emiratos Árabes invierte en hidrógeno verde',
    summary: 'EAU anunció una inversión de 20 mil millones de dólares en hidrógeno verde, posicionándose como líder en la diversificación energética post-petróleo en el Golfo Pérsico.',
    fullContent: `Los EAU anunciaron una inversión de 20.000 millones de dólares en hidrógeno verde, el mayor compromiso de un país del Golfo en diversificación energética. El plan prevé 15 plantas de electrolisis alimentadas por energía solar.

El proyecto busca posicionar a los EAU como líder mundial en producción y exportación de hidrógeno verde. Para 2035 se estima una producción de 1,4 millones de toneladas anuales, reduciendo 10 millones de toneladas de emisiones de CO2.

La UE firmó un memorando para importar hidrógeno emiratí. Japón y Corea del Sur expresaron interés. La iniciativa reduce la dependencia de las exportaciones de petróleo y establece una nueva relación energética con Europa.`,
    region: 'MEDIO ORIENTE',
    classifiers: ['Energía', 'Ecosistema'],
    relevance: 'MEDIA',
    source: 'The National',
    sourceUrl: 'https://example.com/uae-hydrogen',
    language: 'es',
    timestamp: '2025-12-05T14:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-019.webp'
  },
  {
    id: 'SIG-2025-020',
    title: 'NATO expande presencia en el Ártico: nueva base en Noruega',
    summary: 'La OTAN inauguró una nueva base de operaciones en el Ártico noruego, escalando la presencia militar en una región cada vez más disputada por Rusia, China y Occidente.',
    fullContent: `La OTAN inauguró su base más septentrional en Evenes, Noruega, a 200 km de la frontera rusa. La base alberga 1.200 soldados, aviones F-35, radares de alerta temprana y sistemas de guerra electrónica.

El Ártico se ha convertido en nuevo teatro de competición por el derretimiento del hielo polar, que abre rutas marítimas y acceso a petróleo, gas y minerales raros. Rusia reforzó su presencia con 14 nuevas bases.

China se declaró Estado cercano al Ártico y desplegó rompehielos de investigación. Rusia y China realizaron patrullas navales conjuntas en la región.`,
    region: 'EUROPA',
    classifiers: ['Seguridad', 'Ecosistema'],
    relevance: 'ALTA',
    source: 'Nordic Monitor',
    sourceUrl: 'https://example.com/nato-arctic',
    language: 'es',
    timestamp: '2025-12-05T07:00:00Z',
    verified: true,
    sourceLevel: 'C',
    accessLevel: 'RESTRINGIDO',
  },
  {
    id: 'SIG-2025-021',
    title: 'Argentina abandona acuerdo con FMI y busca financiamiento alternativo',
    summary: 'El gobierno argentino anunció la suspensión de pagos al FMI y la búsqueda de fuentes de financiamiento alternativas con China y los BRICS.',
    fullContent: `Argentina anunció la suspensión de pagos al FMI (44.000 millones de dólares, la mayor deuda del organismo con un país individual) y buscará financiamiento alternativo con China y los BRICS.

El ministro de Economía anunció que Argentina dejará de usar el dólar como moneda de referencia y adoptará una canasta con yuan, real y peso. Se acelerará la adhesión formal al bloque BRICS+.

Brasil, China y Sudáfrica expresaron su apoyo. El FMI advirtió sobre consecuencias para el acceso a crédito internacional. El caso argentino podría sentar precedente para otros países del Sur Global endeudados.`,
    region: 'LATAM',
    classifiers: ['Economía', 'Diplomacia', 'Derechos Humanos'],
    relevance: 'CRÍTICA',
    source: 'Página/12',
    sourceUrl: 'https://example.com/argentina-imf',
    language: 'es',
    timestamp: '2025-12-04T20:00:00Z',
    verified: false,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-021.webp'
  },
  {
    id: 'SIG-2025-022',
    title: 'Myanmar: resistencia armada logra avances decisivos contra junta militar',
    summary: 'Las fuerzas de resistencia en Myanmar han logrado los mayores avances territoriales contra la junta militar desde el golpe de 2021, alterando el equilibrio de poder en el país.',
    fullContent: `Las fuerzas de resistencia en Myanmar lograron los mayores avances territoriales contra la junta militar desde el golpe de 2021. La coalición controla gran parte del norte de Shan, oeste de Rakhine y partes de Sagaing.

Los avances incluyen la captura de Lashio, ciudad estratégica en la ruta comercial China-Myanmar. La junta perdió control de al menos 15 ciudades y más de 200 puestos de avanzada.

China adoptó postura ambivalente. La crisis generó 2,5 millones de desplazados internos. Las Naciones Unidas advierten de catástrofe humanitaria inminente.`,
    region: 'ASIA',
    classifiers: ['Conflicto', 'Derechos Humanos'],
    relevance: 'CRÍTICA',
    source: 'Irrawaddy',
    sourceUrl: 'https://example.com/myanmar-resistance',
    language: 'es',
    timestamp: '2025-12-04T12:00:00Z',
    verified: false,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-023',
    title: 'Colombia y Ecuador firman acuerdo de conservación amazónica transfronteriza',
    summary: 'Un acuerdo histórico entre Colombia y Ecuador establece un corredor de conservación transfronterizo en la Amazonía, con financiamiento innovador vinculado a bonos de carbono.',
    fullContent: `Colombia y Ecuador firmaron el Acuerdo de Conservación Amazónica Transfronteriza, estableciendo un corredor de 8 millones de hectáreas. El acuerdo es innovador en su mecanismo de financiamiento con bonos de carbono verificados por la ONU.

El corredor almacena 2.800 millones de toneladas de CO2, valorado en el mercado internacional de carbono. El financiamiento inicial de 350 millones proviene del CAF, Fondo Verde para el Clima y fondos soberanos de Noruega y Alemania.

Las comunidades indígenas y afrocolombianas participarán en la gobernanza del corredor con representación directa en el consejo administrativo.`,
    region: 'LATAM',
    classifiers: ['Ecosistema', 'Derechos Humanos'],
    relevance: 'BAJA',
    source: 'Mongabay Latam',
    sourceUrl: 'https://example.com/colombia-ecuador-amazon',
    language: 'es',
    timestamp: '2025-12-03T10:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-023.webp'
  },
  {
    id: 'SIG-2025-024',
    title: 'Pipeline Nord Stream 3: propuesta alemana genera fractura en la UE',
    summary: 'La propuesta alemana de construir un nuevo gasoducto desde Argelia divide a la Unión Europea, con Francia y Polonia en oposición férrea.',
    fullContent: `La propuesta alemana de un gasoducto desde Argelia generó fractura en la UE. Alemania, Italia y España apoyan el proyecto para diversificar fuentes energéticas. Francia y Polonia se oponen, argumentando que repite errores del Nord Stream y crea dependencia unilateral.

Argelia condiciona el acuerdo a concesiones sobre el Sahara Occidental. Rusia ofreció financiamiento a través de Gazprom, generando sospechas. El debate revela fracturas estructurales de la UE en política energética.`,
    region: 'EUROPA',
    classifiers: ['Energía', 'Economía'],
    relevance: 'MEDIA',
    source: 'Le Monde Diplomatique',
    sourceUrl: 'https://example.com/nord-stream-3',
    language: 'es',
    timestamp: '2025-12-03T07:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'RESTRINGIDO',
  },
  {
    id: 'SIG-2025-025',
    title: 'Cumbre de No Alineados redefine papel en el orden multipolar',
    summary: 'La cumbre del Movimiento de Países No Alineados en Kampala redefinió la agenda del bloque para el siglo XXI, enfocándose en soberanía digital y reforma financiera.',
    fullContent: `La cumbre del MNOAL en Kampala aprobó la Declaración de Kampala con tres ejes: soberanía digital, reforma del sistema financiero internacional y justicia climática.

La declaración exige un marco regulatorio multilateral para la gobernanza de internet y la reforma del FMI y Banco Mundial para eliminar el sesgo occidental en la distribución de cuotas de voto.

China, India y Sudáfrica jugaron un papel mediador clave. La ONU expresó respaldo a las demandas de reforma financiera.`,
    region: 'ÁFRICA',
    classifiers: ['Diplomacia', 'Economía'],
    relevance: 'ALTA',
    source: 'MNOAL Official',
    sourceUrl: 'https://example.com/nam-summit',
    language: 'es',
    timestamp: '2025-12-02T15:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-026',
    title: 'Canadá anuncia moratoria a la minería en el Ártico por presión indígena',
    summary: 'Tras años de resistencia de las Primeras Naciones, Canadá anunció una moratoria de 10 años a la minería en el Ártico canadiense.',
    fullContent: `Canadá anunció una moratoria de 10 años a la minería en el Ártico, respondiendo a décadas de resistencia de las Primeras Naciones, los Inuit y los Métis. La moratoria cubre 2,1 millones de km² donde se planificaban proyectos por 200.000 millones de dólares.

Las organizaciones indígenas celebraron la decisión como hito histórico en la reconciliación. Sin embargo, la industria minera advirtió que podría hacer retroceder el desarrollo económico del norte.`,
    region: 'NORTEAMÉRICA',
    classifiers: ['Ecosistema', 'Derechos Humanos'],
    relevance: 'BAJA',
    source: 'CBC News',
    sourceUrl: 'https://example.com/canada-arctic-mining',
    language: 'es',
    timestamp: '2025-12-02T09:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-026.webp'
  },
  {
    id: 'SIG-2025-027',
    title: 'Turquía bloquea acceso al Mar Negro: amenaza a la Convención de Montreux',
    summary: 'Turquía anunció restricciones al paso de buques de guerra por los Estrechos, reinterpretando la Convención de Montreux en un movimiento que altera el equilibrio naval en el Mar Negro.',
    fullContent: `Turquía restringió el tránsito de buques de guerra por los Estrechos, reinterpretando la Convención de Montreux de 1936. La medida prohíbe el paso de buques de guerra de países sin costa en el Mar Negro.

La OTAN expresó profunda preocupación. Rusia calificó la decisión de prudente. Ucrania solicitó reunión de emergencia del Consejo de la OTAN.`,
    region: 'EUROPA',
    classifiers: ['Seguridad', 'Economía'],
    relevance: 'ALTA',
    source: 'Anadolu Agency',
    sourceUrl: 'https://example.com/turkey-black-sea',
    language: 'es',
    timestamp: '2025-12-01T18:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'RESTRINGIDO',
  },
  {
    id: 'SIG-2025-028',
    title: 'Sudáfrica demanda a Israel ante la CIJ por genocidio en Gaza: actualización',
    summary: 'La Corte Internacional de Justicia emitió nuevas medidas provisionales contra Israel en el caso presentado por Sudáfrica, elevando la presión jurídica internacional.',
    fullContent: `La CIJ emitió nuevas medidas provisionales contra Israel en el caso por presunto genocidio en Gaza. La orden exige cesar operaciones en Rafah y permitir entrada de ayuda humanitaria sin restricciones. Adoptada por 13 votos a favor y 2 en contra.

Israel rechazó la decisión. EE.UU. bloqueó resolución del Consejo de Seguridad para hacerla cumplir. España, Irlanda y Noruega anunciaron sanciones unilaterales si Israel no cumple.`,
    region: 'ÁFRICA',
    classifiers: ['Derechos Humanos', 'Conflicto'],
    relevance: 'CRÍTICA',
    source: 'CIJ Official',
    sourceUrl: 'https://example.com/sa-israel-icj',
    language: 'es',
    timestamp: '2025-12-01T11:00:00Z',
    verified: true,
    sourceLevel: 'A',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-028.webp'
  },
  {
    id: 'SIG-2025-029',
    title: 'Colombia lanza banco de desarrollo regional con capital de países andinos',
    summary: 'Colombia lideró la creación del Banco de Desarrollo Andino con aportes de Ecuador, Perú y Bolivia, buscando financiar proyectos de infraestructura sin condicionamientos del FMI ni del Banco Mundial.',
    fullContent: `Colombia creó el Banco de Desarrollo Andino con capital de 7.000 millones de dólares (Ecuador: 2.500M, Perú: 2.000M, Bolivia: 500M). El banco financia proyectos sin condicionamientos del FMI ni Banco Mundial.

La gobernanza se basa en un país, un voto. Las tasas de interés serán 30-50% inferiores a las del mercado internacional. China expresó interés en cooperar. EE.UU. advirtió sobre riesgos de sostenibilidad.`,
    region: 'LATAM',
    classifiers: ['Economía', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'Telesur',
    sourceUrl: 'https://telesur.net/economia/banco-desarrollo-andino-2026',
    language: 'es',
    timestamp: '2026-04-28T16:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-030',
    title: 'Conflito territorial agrário no Parágua intensifica com despejos em massa',
    summary: 'Manifestações massivas ocorreram no Paraguai após o governo autorizar despejos de comunidades camponesas em favor de grandes produtores de soja, com denúncias de violações de direitos humanos e influência de corporações multinacionais.',
    fullContent: `Manifestações massivas irromperam no Paraguai após o governo autorizar despejos de 5.000 famílias camponesas em favor de extensões de monocultura de soja de corporações multinacionais como Cargill e Monsanto.

Os camponeses denunciam violência policial excessiva, incluindo gases lacrimogêneos e prisões arbitrárias. A ONU pediu a suspensão imediata dos despejos. O caso revela a tensão entre o agronegócio transnacional e comunidades camponesas no Cone Sul.`,
    region: 'LATAM',
    classifiers: ['Conflicto', 'Derechos Humanos'],
    relevance: 'ALTA',
    source: 'Folha de São Paulo',
    sourceUrl: 'https://folha.uol.com.br/mundo/conflito-agrario-paraguai-2026',
    language: 'pt',
    timestamp: '2026-04-27T10:15:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-030.webp'
  },
  {
    id: 'SIG-2025-031',
    title: 'Cuba despliega red 5G propia con tecnología conjunta con China y Rusia',
    summary: 'Cuba inauguró una red 5G desarrollada con tecnología de Huawei y empresas rusas, eludiendo el bloqueo estadounidense y marcando un hito en la soberanía tecnológica del Caribe frente a las sanciones.',
    fullContent: `Cuba inaugurou sua rede 5G desenvolvida com Huawei e Rostelecom, cobrindo Havana, Varadero, Santiago de Cuba e Santa Clara. O projeto de 800 milhões de dólares usa tecnologia openRAN.

EE.UU. incluiu engenheiros cubanos e empresas russas em sua lista de sanções OFAC. Venezuela e Nicarágua expressaram interesse em tecnologia similar. O governo cubano declarou que nenhuma sanção deterá seu direito à conectividade.`,
    region: 'LATAM',
    classifiers: ['Tecnología', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'Prensa Latina',
    sourceUrl: 'https://www.prensalatina.com.cu/tecnologia/cuba-5g-soberania-2026',
    language: 'es',
    timestamp: '2026-04-26T14:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-032',
    title: 'Incendios récord en la Amazonía boliviana generan emergencia climática regional',
    summary: 'Los incendios forestales en la Amazonía boliviana alcanzaron cifras récord en abril, destruyendo más de 800 mil hectáreas y generando una emergencia climática que afecta a Brasil, Perú y Paraguay con humo tóxico.',
    fullContent: `Incêndios florestais na Amazônia boliviana atingiram 34.000 focos de calor em abril, destruindo 800.000 hectares. Pior abril desde 1998, superando a média histórica em 300%.

Fumaça tóxica afetou 15 milhões de pessoas no Brasil, Peru e Paraguai. Níveis de PM2.5 chegaram a 12 vezes o limite da OMS. O governo culpou o El Niño e queimadas ilegais, mas ambientalistas apontam a desregulação de 2024 como causa principal.`,
    region: 'LATAM',
    classifiers: ['Ecosistema', 'Seguridad'],
    relevance: 'MEDIA',
    source: 'Telesur',
    sourceUrl: 'https://telesur.net/medio-ambiente/incendios-amazonia-bolivia-2026',
    language: 'es',
    timestamp: '2026-04-25T09:45:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: 'https://placehold.co/800x400/0A0F1C/00E5A0?text=SIG-2025-032',
  },
  {
    id: 'SIG-2025-033',
    title: 'Celac y ASEAN establecen mecanismo de diálogo estratégico permanente',
    summary: 'La CELAC y la ASEAN firmaron un acuerdo para crear un mecanismo de diálogo estratégico permanente, buscando fortalecer la cooperación Sur-Sur entre América Latina y el Sudeste Asiático.',
    fullContent: `A CELAC e a ASEAN firmaram o Mecanismo de Diálogo Estratégico Permanente em Jacarta. O acordo estabelece reuniões ministeriais anuais, grupos de trabalho e um fundo de cooperação de 500 milhões de dólares.

Espera-se que o comércio bilateral, atualmente em 280 bilhões de dólares, cresça 25% em cinco anos. Analistas veem o acordo como reflexo da autonomia crescente do Sul Global na configuração de sua própria arquitetura de cooperação.`,
    region: 'LATAM',
    classifiers: ['Diplomacia', 'Economía'],
    relevance: 'INFORMATIVA',
    source: 'RT',
    sourceUrl: 'https://rt.com/latam/celac-asean-dialogo-sur-global-2026',
    language: 'es',
    timestamp: '2026-04-24T18:00:00Z',
    verified: false,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-033.webp'
  },
  {
    id: 'SIG-2025-034',
    title: 'Rusia y Serbia realizan ejercicios militares conjuntos en la frontera con Kosovo',
    summary: 'Rusia y Serbia llevaron a cabo ejercicios militares conjuntos cerca de la frontera con Kosovo, en una muestra de fuerza que eleva las tensiones en los Balcanes y desafía la presencia de la OTAN en la región.',
    fullContent: `Rusia y Serbia realizaron ejercicios militares conjuntos "Slavic Brotherhood 2026" cerca de la frontera con Kosovo, con 5.000 soldados en total. Incluyeron simulaciones de combate urbano y artillería pesada.

La OTAN elevó alerta en Kosovo. Serbia considera los ejercicios demostración de capacidad defensiva soberana. Rusia utiliza el conflicto como herramienta de influencia en los Balcanes.`,
    region: 'EUROPA',
    classifiers: ['Seguridad', 'Conflicto'],
    relevance: 'ALTA',
    source: 'RT',
    sourceUrl: 'https://rt.com/russia/serbia-military-exercises-kosovo-2026',
    language: 'es',
    timestamp: '2026-04-28T07:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'RESTRINGIDO',
  },
  {
    id: 'SIG-2025-035',
    title: 'Turkey blocks Black Sea access amid grain corridor dispute with Russia',
    summary: 'Turkey restricted naval traffic through the Bosphorus Strait citing security concerns after Russia withdrew from the Black Sea Grain Initiative, threatening global food supplies for import-dependent nations across Africa and the Middle East.',
    fullContent: `Turkey restricted naval traffic through the Bosphorus Strait after Russia withdrew from the Black Sea Grain Initiative. The move threatens food supplies for 350 million people in 45 countries, particularly in Somalia, Yemen, Ethiopia and Afghanistan.

The UN World Food Programme warned of massive food security impacts. Russia defended Turkey's decision while Ukraine called for an emergency Security Council meeting. The EU announced 500 million euros in emergency food aid.`,
    region: 'EUROPA',
    classifiers: ['Seguridad', 'Economía'],
    relevance: 'BAJA',
    source: 'TRT World',
    sourceUrl: 'https://www.trtworld.com/turkey/bosphorus-restriction-grain-corridor-2026',
    language: 'en',
    timestamp: '2026-04-27T13:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-036',
    title: 'Hungría aprueba ley anti-inmigración que viola convenios europeos de derechos humanos',
    summary: 'El parlamento húngaro aprobó una ley que permite la expulsión sumaria de solicitantes de asilo sin derecho a apelación, violando abiertamente los convenios europeos de derechos humanos y generando una crisis institucional en la UE.',
    fullContent: `El parlamento húngaro aprobó la Ley de Protección de la Soberanía Migratoria, permitiendo expulsión sumaria de solicitantes de asilo sin apelación, centros de retorno en frontera y criminalización de organizaciones que asisten a migrantes.

El Comisionado Europeo de Derechos Humanos calificó la ley de violación directa de la Convención Europea de Derechos Humanos. La CE anunció procedimiento de infracción y posible suspensión de fondos por 7.500 millones de euros.`,
    region: 'EUROPA',
    classifiers: ['Derechos Humanos', 'Seguridad'],
    relevance: 'ALTA',
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.com/europe/hungary-anti-immigration-law-2026',
    language: 'es',
    timestamp: '2026-04-26T11:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-036.webp'
  },
  {
    id: 'SIG-2025-037',
    title: 'Turkmenistán y la UE firman acuerdo de suministro de gas natural por gasoducto transcaspio',
    summary: 'Turkmenistán y la Unión Europea firmaron un acuerdo histórico para la construcción de un gasoducto transcaspio que diversificará las fuentes energéticas europeas, reduciendo la dependencia del gas ruso.',
    fullContent: `Turkmenistán y la UE firmaron un acuerdo para el Gasoducto Transcaspio, de 1.200 km y 25.000 millones de dólares, para reducir la dependencia europea del gas ruso. Turkmenistán posee la cuarta mayor reserva de gas natural del mundo.

Rusia se opone a infraestructura que compita con sus exportaciones. Irán reclamó parte del fondo marino del Caspio. Azerbaiyán se ofrece como hub de distribución. Fue la primera visita de un líder europeo de alto nivel a Turkmenistán en 15 años.`,
    region: 'EUROPA',
    classifiers: ['Energía', 'Diplomacia'],
    relevance: 'BAJA',
    source: 'Xinhua',
    sourceUrl: 'https://xinhuanet.com/world/turkmenistan-eu-gas-pipeline-2026',
    language: 'es',
    timestamp: '2026-04-25T08:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-038',
    title: '南海争端升级：菲律宾与美国举行联合海上巡逻引发中国强烈反应',
    summary: '菲律宾与美国在南中国海启动大规模联合海上巡逻，中国外交部对此表示强烈抗议并派遣海警船只进行跟踪监视，地区紧张局势显著升级，多国呼吁通过外交途径解决争端。',
    fullContent: `菲律宾与美国在南中国海启动大规模联合海上巡逻，部署两艘航母战斗群和多架巡逻机。中国外交部表示强烈抗议并派遣海警船只跟踪监视。

南海每年承载超过3.4万亿美元的全球贸易额。紧张局势升级导致地区国家增加军费：菲律宾2025年国防预算增长18%。多国外交官呼吁通过《南海行为准则》解决争端，但中国坚持双边谈判，拒绝多边框架。`,
    region: 'ASIA',
    classifiers: ['Conflicto', 'Seguridad'],
    relevance: 'CRÍTICA',
    source: 'Xinhua',
    sourceUrl: 'https://xinhuanet.com/world/south-china-sea-patrol-2026',
    language: 'zh',
    timestamp: '2026-04-28T03:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-039',
    title: '中国宣布建成全球首条量子加密通信干线连接亚洲与非洲',
    summary: '中国正式宣布京非量子通信干线建成开通，该线路经陆路和海路连接北京与内罗毕，全长超过一万五千公里，标志着全球量子通信网络建设取得重大突破。',
    fullContent: `中国正式宣布京非量子通信干线建成开通，连接北京与内罗毕，全长超过一万五千公里。采用卫星和光纤混合量子密钥分发技术，实现理论上无法破解的端到端加密通信。

印度、日本和韩国对此表示关切，担心中国利用量子通信在非洲扩大影响力。美国国防部加速与日本、澳大利亚和印度的联合量子技术研发项目。非洲联盟对该基础设施表示欢迎。`,
    region: 'ASIA',
    classifiers: ['Tecnología', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'CGTN',
    sourceUrl: 'https://cgtn.com/technology/quantum-communication-asia-africa-2026',
    language: 'zh',
    timestamp: '2026-04-27T06:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-039.webp'
  },
  {
    id: 'SIG-2025-040',
    title: 'India se convierte en el tercer fabricante mundial de semiconductores',
    summary: 'India inauguró su primera fábrica de semiconductores avanzados en Gujarat, convirtiéndose en el tercer fabricante mundial de chips y desafiando el duopolio de Taiwán y Corea del Sur en la cadena global de suministro.',
    fullContent: `India inaugurated its first advanced semiconductor fab in Gujarat, built by Tata-TSMC joint venture with $12 billion investment, becoming the world's third-largest chip manufacturer. The fab produces 5nm and 3nm chips.

US supports India's semiconductor development through the CHIPS Act with $2.5 billion in subsidies. However, analysts note India faces challenges in infrastructure, talent shortage and water resources — each chip requires thousands of gallons of ultra-pure water.`,
    region: 'ASIA',
    classifiers: ['Tecnología', 'Economía'],
    relevance: 'ALTA',
    source: 'The Hindu',
    sourceUrl: 'https://thehindu.com/business/india-semiconductor-fab-gujarat-2026',
    language: 'es',
    timestamp: '2026-04-24T10:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-041',
    title: 'Pakistán y China aceleran construcción del gasoducto China-Pakistán en Baluchistán',
    summary: 'Pakistán y China aceleraron la construcción del tramo final del gasoducto que conectará el puerto de Gwadar con Xinjiang, pese a los ataques de grupos separatistas baluchi y las crecientes preocupaciones sobre la viabilidad económica del corredor.',
    fullContent: `Pakistan and China accelerated construction of the CPEC gas pipeline connecting Gwadar Port to Xinjiang. The 2,700 km pipeline is one of the Belt and Road Initiative's most strategic infrastructure projects.

Baloch separatist attacks have killed over 60 workers. Construction costs escalated from $2.5 billion to over $6 billion. The IMF warned about Pakistan's worsening debt sustainability. China reaffirmed its firm support for the project.`,
    region: 'ASIA',
    classifiers: ['Energía', 'Economía'],
    relevance: 'MEDIA',
    source: 'Xinhua',
    sourceUrl: 'https://xinhuanet.com/world/cpec-pipeline-baluchistan-2026',
    language: 'es',
    timestamp: '2026-04-23T15:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'RESTRINGIDO',
  },
  {
    id: 'SIG-2025-042',
    title: 'North Korea deploys tactical nuclear weapons near DMZ amid peninsula tensions',
    summary: 'North Korea announced the deployment of tactical nuclear weapons near the Demilitarized Zone, marking a dramatic escalation that threatens the fragile armistice and forces South Korea and Japan to reconsider their defense postures.',
    fullContent: `North Korea announced deployment of tactical nuclear weapons at five locations near the DMZ, the most aggressive nuclear posture shift since the 1953 armistice. Mobile launch platforms carry warheads with 10-50 kiloton yields.

South Korea activated Aegis missile defense systems. The US reaffirmed extended deterrence commitments. China issued a rare statement urging restraint. The IAEA expressed concern about lack of verification mechanisms.`,
    region: 'ASIA',
    classifiers: ['Seguridad', 'Conflicto'],
    relevance: 'ALTA',
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.com/asia/north-korea-tactical-nuclear-dmz-2026',
    language: 'en',
    timestamp: '2026-04-22T21:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'RESTRINGIDO',
    image: '/signals/sig-042.webp',
  },
  {
    id: 'SIG-2025-043',
    title: 'محكمة العدل الدولية تفتح تحقيقاً في مزاعم إبادة جماعية في دارفور',
    summary: 'أعلنت محكمة العدل الدولية فتح تحقيق رسمي في مزاعم الإبادة الجماعية والجرائم ضد الإنسانية في إقليم دارفور السوداني، وسط تصاعد العنف بين القوات شبه العسكرية والميليشيات المحلية.',
    fullContent: `أعلنت محكمة العدل الدولية فتح تحقيق رسمي في مزاعم الإبادة الجماعية في دارفور بناء على شكوى من دول أفريقية بدعم من الاتحاد الأفريقي. التقرير يوثق 12 ألف حالة قتل وأكثر من 800 ألف نازح.

السودان رفض القرار واصفا إياه بتدخل سافر. جنوب السودان أعلن استعداده لاستضافة مفاوضات سلام. منظمة العفو الدولية دعت لفرض حظر عاجل على توريد الأسلحة للسودان.`,
    region: 'ÁFRICA',
    classifiers: ['Derechos Humanos', 'Conflicto'],
    relevance: 'CRÍTICA',
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.net/africa/darfur-icj-genocide-investigation-2026',
    language: 'ar',
    timestamp: '2026-04-28T12:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-044',
    title: 'Zambia negocia reestructuración de deuda con China tras default soberano',
    summary: 'Zambia inició negociaciones con China para reestructurar su deuda de 6.800 millones de dólares, marcando un caso testigo para la resolución de crisis de sobreendeudamiento en África y la influencia de Pekín en el continente.',
    fullContent: `Zambia inició negociaciones con China para reestructurar su deuda de 6.800 millones de dólares, convirtiéndose en caso testigo para África subsahariana. Se busca reducir el valor presente en un 40% y extender plazos a 25 años.

China, que posee el 30% de la deuda, condiciona la renegociación a la continuación de proyectos de infraestructura. Economistas señalan que el caso revela la complejidad de la arquitectura de deuda del continente con múltiples acreedores.`,
    region: 'ÁFRICA',
    classifiers: ['Economía', 'Diplomacia'],
    relevance: 'MEDIA',
    source: 'Africa News',
    sourceUrl: 'https://africanews.com/economy/zambia-china-debt-restructuring-2026',
    language: 'es',
    timestamp: '2026-04-27T09:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-044.webp'
  },
  {
    id: 'SIG-2025-045',
    title: 'Gran Muralla Verde del Sahara alcanza hito del 20% de meta de restauración',
    summary: 'La iniciativa africana Gran Muralla Verde anunció que ha restaurado el 20% de los 100 millones de hectáreas previstas, aunque críticos señalan que el ritmo es insuficiente y que las comunidades locales no están siendo suficientemente involucradas.',
    fullContent: `La Gran Muralla Verde anunció que ha restaurado el 20% de la meta de 100 millones de hectáreas, alcanzando 20 millones en 11 países del Sahel. Los países con mayores avances son Etiopía (6,5M), Níger (4,2M) y Nigeria (3,1M).

Investigadores advierten que el ritmo actual es insuficiente frente a una desertificación de 12 millones de hectáreas por año. Comunidades locales denuncian falta de participación y priorización de especies comerciales sobre sistemas agrícolas tradicionales.`,
    region: 'ÁFRICA',
    classifiers: ['Ecosistema', 'Economía'],
    relevance: 'ALTA',
    source: 'Africa News',
    sourceUrl: 'https://africanews.com/environment/great-green-wall-milestone-2026',
    language: 'es',
    timestamp: '2026-04-26T16:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: 'https://placehold.co/800x400/0A0F1C/00E5A0?text=SIG-2025-045',
  },
  {
    id: 'SIG-2025-046',
    title: 'Conflito no Sahel: junta do Mali expulsa forças da ONU e fecha base francesa',
    summary: 'A junta militar do Mali ordenou a expulsão imediata das forças de peacekeeping da ONU e o fechamento da última base militar francesa no país, reforçando a virada estratégica em direção à Rússia e ao Grupo Wagner.',
    fullContent: `A junta do Mali ordenou a expulsão imediata da MINUSMA (13.000 soldados) e o fechamento da última base francesa em Gao, marcando o ponto culminante da viragem em direção à Rússia e ao Grupo Wagner.

A ONU expressou grave preocupação pelo vácuo de segurança na região norte, onde grupos jihadistas continuam ativos. A Rússia celebrou a decisão como fim da interferência neocolonial. A CEDEAO suspendeu o Mali de suas atividades.`,
    region: 'ÁFRICA',
    classifiers: ['Conflicto', 'Seguridad'],
    relevance: 'ALTA',
    source: 'Folha de São Paulo',
    sourceUrl: 'https://folha.uol.com.br/mundo/mali-expulsa-onu-franca-2026',
    language: 'pt',
    timestamp: '2026-04-25T14:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-046.webp'
  },
  {
    id: 'SIG-2025-047',
    title: 'Mozambique recurre a tropas de Ruanda para combatir insurgencia en Cabo Delgado',
    summary: 'Mozambique renovó el acuerdo con fuerzas ruandesas desplegadas en Cabo Delgado para combatir la insurgencia yihadista, generando debate sobre la privatización de la seguridad y el papel de potencias regionales en conflictos africanos.',
    fullContent: `Mozambique renovó el acuerdo con fuerzas ruandesas en Cabo Delgado contra la insurgencia yihadista. El renovado acuerdo prevé 1.500 soldados ruandeses por tres años más, financiamiento compartido entre Mozambique, la UA y la UE.

Críticos señalan que la dependencia de fuerzas extranjeras socava la capacidad institucional mozambiqueña y crea precedentes peligrosos para la soberanía africana.`,
    region: 'ÁFRICA',
    classifiers: ['Conflicto', 'Economía'],
    relevance: 'MEDIA',
    source: 'Prensa Latina',
    sourceUrl: 'https://www.prensalatina.com.cu/mundo/mozambique-ruanda-cabo-delgado-2026',
    language: 'es',
    timestamp: '2026-04-22T17:30:00Z',
    verified: false,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-048',
    title: 'تصعيد عسكري في اليمن: هجمات متبادلة بين الحوثيين والقوات السعودية',
    summary: 'شهد اليمن تصعيداً عسكرياً خطيراً بعد أن شنت القوات الحوثية هجمات صاروخية على منشآت نفطية سعودية، ردت عليها الرياض بقصف جوي مكثف على صنعاء وحجة، مما يهدد بانهيار الهدنة المبرمة عام 2022.',
    fullContent: `شهد اليمن تصعيداً عسكرياً خطيراً إثر هجمات صاروخية حوثية على منشآت نفطية سعودية. ردت الرياض بقصف جوي مكثف أدى لمقتل أكثر من 80 مدنياً. الأمم المتحدة حذرت من انهيار الهدنة المبرمة عام 2022.

21,6 مليون يمني يحتاجون مساعدات إنسانية عاجلة. الولايات المتحدة أعربت عن قلقها العميق لكن الحوثيين رفضوا دعوات إحياء مفاوضات السلام.`,
    region: 'MEDIO ORIENTE',
    classifiers: ['Conflicto', 'Seguridad'],
    relevance: 'CRÍTICA',
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.net/middle-east/yemen-houthi-saudi-escalation-2026',
    language: 'ar',
    timestamp: '2026-04-28T08:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-048.webp'
  },
  {
    id: 'SIG-2025-049',
    title: 'Irán inaugura la mayor planta solar de Medio Oriente en desafío a sanciones',
    summary: 'Irán inauguró la mayor planta de energía solar de Medio Oriente en la provincia de Kerman, con capacidad de 2 gigavatios, en un desafío a las sanciones occidentales y un paso hacia la diversificación de su matriz energética.',
    fullContent: `Irán inauguró la mayor planta solar de Medio Oriente en Kerman (2 GW), construida con tecnología principalmente iranía. El proyecto "Sol de Kerman" cubre 3.200 hectáreas y es parte de la estrategia para generar 20% de electricidad renovable para 2030.

Irán utilizó swap petrolero con India, inversión del Banco de Desarrollo de China y empresas privadas iranías. Expertos de Oxford señalan que el modelo iraní de desarrollo solar bajo sanciones podría replicarse en otros países del Sur Global.`,
    region: 'MEDIO ORIENTE',
    classifiers: ['Energía', 'Economía'],
    relevance: 'MEDIA',
    source: 'TRT World',
    sourceUrl: 'https://www.trtworld.com/middle-east/iran-solar-plant-kerman-2026',
    language: 'es',
    timestamp: '2026-04-23T12:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-050',
    title: 'Saudi Arabia and Iran announce joint Persian Gulf security framework',
    summary: 'Saudi Arabia and Iran announced a joint maritime security framework for the Persian Gulf, marking a historic breakthrough in regional cooperation and reducing reliance on US naval presence in one of the world\'s most strategic waterways.',
    fullContent: `Saudi Arabia and Iran established a Joint Persian Gulf Maritime Security Framework, creating a joint command center for maritime surveillance, search and rescue, and counter-piracy patrols. Both commit to resolving incidents through a bilateral hotline.

The US expressed cautious optimism but voiced concern about exclusion of other Gulf states. China offered technical support. Analysts at IISS described it as the most significant restructuring of Gulf security architecture since 1945.`,
    region: 'MEDIO ORIENTE',
    classifiers: ['Diplomacia', 'Seguridad'],
    relevance: 'ALTA',
    source: 'RT',
    sourceUrl: 'https://rt.com/middleeast/saudi-iran-gulf-security-2026',
    language: 'en',
    timestamp: '2026-04-21T10:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-050.webp'
  },
  {
    id: 'SIG-2025-051',
    title: 'Qatar lanza plataforma digital de pagos para el mundo árabe con tecnología blockchain',
    summary: 'Qatar presentó una plataforma de pagos digitales basada en blockchain diseñada para los países árabes, buscando crear un ecosistema financiero regional alternativo a los sistemas occidentales y reducir las fricciones en el comercio intrarregional.',
    fullContent: `Qatar presentó una plataforma de pagos digitales basada en blockchain para los países árabes. La plataforma, denominada "Dirham Digital", busca crear un ecosistema de pagos interoperable entre los 22 estados miembros de la Liga Árabe, reduciendo la dependencia de los sistemas SWIFT y Visa occidentales.

El Banco Central de Qatar, que lidera el desarrollo, aseguró que la plataforma cumple con los estándares del Banco de Pagos Internacionales (BIS) y que ha sido auditada por firmas internacionales independientes. Se espera que la plataforma esté operativa para finales de 2027.`,
    region: 'MEDIO ORIENTE',
    classifiers: ['Tecnología', 'Economía'],
    relevance: 'MEDIA',
    source: 'CGTN',
    sourceUrl: 'https://cgtn.com/middle-east/qatar-dinarpay-blockchain-arab-2026',
    language: 'es',
    timestamp: '2026-04-20T15:00:00Z',
    verified: false,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-052',
    title: 'US dollar share of global reserves falls below 55% for first time in decades',
    summary: 'IMF data reveals the US dollar\'s share of global foreign exchange reserves has fallen below 55% for the first time since 1995, as central banks across the Global South accelerate diversification into gold, yuan and alternative currencies.',
    fullContent: `IMF Currency Composition of Official Foreign Exchange Reserves (COFER) data released this week reveals that the US dollar's share of global reserves has fallen to 54.8%, the lowest level since 1995. The decline has been accelerating since 2020, driven by central banks in China, India, Brazil and several Middle Eastern oil exporters.

Central banks across the Global South have been the primary drivers of diversification. China's PBOC has been the largest buyer of gold for 18 consecutive months, adding over 300 tonnes to its reserves. India's RBI has diversified into yuan-denominated bonds and gold. Brazil and Argentina have signed bilateral trade agreements settling in local currencies.

The trend reflects a structural shift in global monetary power. Analysts at the Bank for International Settlements (BIS) note that while the dollar remains dominant, its decline below 55% is psychologically significant and reflects growing confidence in alternatives. The BRICS development bank has proposed a new reserve currency basket that could further accelerate the trend.`,
    region: 'NORTEAMÉRICA',
    classifiers: ['Economía', 'Diplomacia'],
    relevance: 'ALTA',
    source: 'Xinhua',
    sourceUrl: 'https://xinhuanet.com/world/dollar-reserves-decline-global-2026',
    language: 'en',
    timestamp: '2026-04-28T14:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-052.webp',
  },
  {
    id: 'SIG-2025-053',
    title: 'Estados Unidos establece comando espacial dedicado al Pacífico en Guam',
    summary: 'El Pentágono inauguró un comando espacial regional en Guam destinado a contrarrestar las capacidades antisatélite de China y Rusia, escalando la militarización del espacio y la competencia estratégica en el Indo-Pacífico.',
    fullContent: `El Pentágono inauguró el Comando Espacial del Indo-Pacífico (INDOPACOM-SPACE) en la base de Andersen, Guam, con la misión explícita de proteger satélites estadounidenses y aliados de las crecientes capacidades antisatélite de China y Rusia. El comando integra 1.200 operadores especializados y sistemas de vigilancia espacial de última generación.

China, que realizó más de 60 pruebas antisatélite en la última década, respondió calificando la iniciativa de "escalada militar del espacio" y recordando que China propuso sin éxito un tratado de no militarización espacial en la Conferencia de Desarme de la ONU. Rusia reiteró su oposición a la instalación de sistemas armados en el espacio.

Guam, territorio estadounidense en el Pacífico occidental, se convierte así en el epicentro de la competición espacial-militar del siglo XXI. La base está a 3.000 km de las costas chinas y dentro del alcance de los misiles hipersónicos DF-17 chinos. Analistas del Instituto RAND señalan que cualquier conflicto en la región comenzaría inevitablemente con un ataque masivo contra satélites, lo que destruiría las comunicaciones y la navegación GPS de ambos bandos.`,
    region: 'NORTEAMÉRICA',
    classifiers: ['Seguridad', 'Tecnología'],
    relevance: 'CRÍTICA',
    source: 'RT',
    sourceUrl: 'https://rt.com/usa/space-command-guam-pacific-2026',
    language: 'es',
    timestamp: '2026-04-26T20:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'RESTRINGIDO',
  },
  {
    id: 'SIG-2025-054',
    title: 'Canadá: hallazgo de nueva fosa común en escuela residencial indígena genera crisis',
    summary: 'Se descubrieron los restos de al menos 215 niños en los terrenos de una antigua escuela residencial para indígenas en Saskatchewan, reavivando las demandas de justicia y reparación por el genocidio cultural de los pueblos originarios en Canadá.',
    fullContent: `Un equipo forense de la Universidad de Saskatchewan descubrió los restos de al menos 215 niños indígenas en los terrenos de la antigua Escuela Residencial Marieval, operada por la Iglesia Católica entre 1899 y 1997. Los restos incluyen niños de entre 4 y 15 años, muchos con evidencia de enfermedades, desnutrición y violencia física.

El primer ministro canadiense Justin Trudeau calificó el hallazgo de "vergüenza nacional" y anunció una comisión de investigación independiente con poder para citar a testigos y exigir documentos a la Iglesia Católica. La Asamblea de las Primeras Naciones exigió que el Papa visite Canadá para pedir perdón oficialmente.

El caso se suma al hallazgo de Kamloops en 2021, donde se encontraron 215 restos en otra escuela residencial de la Columbia Británica. Se estima que entre 4.000 y 6.000 niños murieron en el sistema de escuelas residenciales canadienses, diseñado para asimilar por la fuerza a los pueblos indígenas. La Comisión de Verdad y Reconciliación de Canadá (2015) calificó el sistema de "genocidio cultural". El descubrimiento ha generado una crisis institucional que cuestiona la imagen internacional de Canadá como líder en derechos humanos.`,
    region: 'NORTEAMÉRICA',
    classifiers: ['Derechos Humanos', 'Ecosistema'],
    relevance: 'ALTA',
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.com/americas/canada-indigenous-graves-saskatchewan-2026',
    language: 'es',
    timestamp: '2026-04-24T16:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-054.webp'
  },
  {
    id: 'SIG-2025-055',
    title: 'México y Estados Unidos en disputa por el agua del Río Colorado ante sequía extrema',
    summary: 'La sequía histórica en el suroeste de Estados Unidos y el norte de México ha intensificado la disputa por el agua del Río Colorado, con México exigiendo el cumplimiento de los tratados de distribución hídrica que Estados Unidos no ha respetado.',
    fullContent: `El embalse Mead, el mayor reservorio de agua de EE.UU., alcanzó su nivel más bajo en la historia (27% de capacidad), provocando cortes de agua en estados como Arizona, Nevada y California. México, que según el Tratado de Aguas de 1944 tiene derecho a 1.850 millones de metros cúbicos anuales del Río Colorado, no ha recibido su cuota completa en cinco de los últimos diez años.

El presidente de México reclamó ante la Comisión Internacional de Límites y Aguas que EE.UU. ha priorizado el suministro a las ciudades y granjas de California en detrimento de las obligaciones con México. La crisis afecta directamente a 3,5 millones de personas en los estados de Baja California y Sonora, además de la agricultura del Valle de Mexicali.

Expertos del Instituto del Agua de la UNAM advierten que la megasequía del suroeste estadounidense es la peor en 1.200 años, según datos dendrocronológicos. La disputa por el agua del Colorado se suma a las tensiones migratorias y comerciales entre ambos países, y podría convertirse en el principal factor de conflicto bilateral en la próxima década si no se negocia un nuevo marco de distribución hídrica.`,
    region: 'NORTEAMÉRICA',
    classifiers: ['Ecosistema', 'Seguridad'],
    relevance: 'MEDIA',
    source: 'Telesur',
    sourceUrl: 'https://telesur.net/medio-ambiente/colorado-water-dispute-mexico-us-2026',
    language: 'es',
    timestamp: '2026-04-22T11:30:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
  },
  {
    id: 'SIG-2025-056',
    title: 'Cuba preside movimiento de 120 países no alineados en cumbre contra bloqueos unilaterales',
    summary: 'Cuba asumió la presidencia del Movimiento de Países No Alineados y convocó una cumbre extraordinaria contra los bloqueos y sanciones unilaterales, denunciando estas prácticas como herramientas de coerción que violan el derecho internacional.',
    fullContent: `Cuba asumió formalmente la presidencia pro tempore del Movimiento de Países No Alineados (MNOAL) en una ceremonia en La Habana, convocando una cumbre extraordinaria de los 120 países miembros bajo el lema "Contra las sanciones y los bloqueos: por la soberanía y la autodeterminación".

La declaración final de la cumbre denuncia que las sanciones unilaterales impuestas por EE.UU. y la UE afectan a un tercio de la población mundial y constituyen una violación del derecho internacional, la Carta de la ONU y los principios de no injerencia. El documento exige la creación de un mecanismo de registro de daños causados por sanciones unilaterales y la celebración de una conferencia internacional sobre el impacto de las medidas coercitivas unilaterales.

China, Rusia, Irán, Venezuela y Nicaragua expresaron su apoyo pleno a la iniciativa cubana. La India, históricamente más moderada en el MNOAL, apoyó la declaración pero pidió un enfoque más pragmático. La representante de la UE rechazó las acusaciones, argumentando que las sanciones europeas son "medidas legales y proporcionadas". La resolución fue aprobada por 112 votos a favor, 5 en contra y 3 abstenciones.`,
    region: 'NORTEAMÉRICA',
    classifiers: ['Diplomacia', 'Economía'],
    relevance: 'ALTA',
    source: 'Prensa Latina',
    sourceUrl: 'https://www.prensalatina.com.cu/mundo/cuba-noal-bloqueos-unilaterales-2026',
    language: 'es',
    timestamp: '2026-04-20T14:00:00Z',
    verified: true,
    sourceLevel: 'B',
    accessLevel: 'ABIERTO',
    image: '/signals/sig-056.webp'
  },
];
