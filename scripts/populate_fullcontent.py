import re

with open('/home/z/my-project/src/data/signals.ts', 'r') as f:
    content = f.read()

full_contents = {
    'SIG-2025-001': """Los líderes de los diez países miembros del bloque BRICS+ — Brasil, Rusia, India, China, Sudáfrica, más los nuevos miembros: Arabia Saudita, Emiratos Árabes Unidos, Irán, Egipto y Etiopía — anunciaron la creación del Sistema de Pagos Transfronterizos BRICS (SPT-BRICS), un mecanismo que utiliza tecnología blockchain y una moneda de reserva canasta basada en los tipos de cambio de las monedas miembros.

El sistema busca eliminar la dependencia del dólar estadounidense en el comercio bilateral entre los países del bloque, que representa el 35% del PIB mundial y el 45% de la población global. Según el Banco Central de Brasil, el volumen de comercio intra-BRICS alcanzó los 4.8 billones de dólares en 2024, con una proyección de crecimiento del 18% anual.

La Reserva Federal de EE.UU. expresó su preocupación por el impacto potencial en la hegemonía del dólar como moneda de reserva global. Los países del Sur Global ven en esta iniciativa una herramienta de soberanía financiera y una alternativa al sistema de pagos dominado por occidente, que ha utilizado el control del SWIFT como instrumento de presión geopolítica.""",

    'SIG-2025-002': """El comandante de la Guardia Revolucionaria Iraní, el general Hossein Salami, declaró en Teherán que Irán tiene la capacidad operativa de cerrar el Estrecho de Ormuz en un plazo de 48 horas si las nuevas sanciones occidentales no son levantadas. El Estrecho de Ormuz es un corredor marítimo por el que transita aproximadamente el 20% del petróleo mundial y el 35% del petróleo comercializado por mar.

Las sanciones, anunciadas la semana pasada por la Unión Europea y reforzadas por la administración estadounidense, apuntan al sector petroquímico iraní y a las empresas vinculadas al programa de drones del país. Teherán las calificó de violación flagrante del derecho internacional y acto de guerra económica.

El Departamento de Defensa de EE.UU. elevó el nivel de alerta de sus fuerzas en la región, desplazando un grupo de portaaviones adicionales al Golfo Pérsico. China, principal comprador de petróleo iraní, instó a la moderación y el diálogo, mientras Rusia respaldó el derecho iraní a defender su soberanía económica. Los precios del petróleo Brent saltaron un 12% en las últimas 48 horas.""",

    'SIG-2025-003': """El satélite QSS-3 (Quantum Secure Satellite-3), lanzado desde el Centro de Lanzamiento de Satélites de Jiuquan, representa la tercera generación de satélites de comunicación cuántica de China y el primero diseñado para establecer enlaces con estaciones terrestres en países socios del Sur Global.

A diferencia de los satélites anteriores Micius (2016) y Jinan-1 (2022), el QSS-3 utiliza una nueva tecnología de distribución de claves cuánticas (QKD) de largo alcance capaz de operar tanto de día como de noche, superando una de las principales limitaciones técnicas de los sistemas anteriores.

Estados Unidos considera que el avance cuántico chino amenaza la capacidad de interceptación de comunicaciones de la NSA y la CIA. La OTAN ha acelerado su propio programa cuántico, con una inversión de 3.200 millones de euros. Sin embargo, expertos de la Academia China de Ciencias señalan que el sistema QSS-3 tiene al menos tres años de ventaja sobre los esfuerzos occidentales equivalentes.""",

    'SIG-2025-004': """El general Abdourahamane Tchiani, líder de la junta militar que tomó el poder en Níger, emitió un decreto disolviendo la Asamblea Nacional, el Tribunal Constitucional y todas las instituciones democráticas del país. La decisión genera un vacío de poder total en la región del Sahel.

La CEDEAO condenó la medida y suspendió inmediatamente a Níger. La Unión Africana activó su mecanismo de respuesta a crisis constitucionales. Francia retiró a sus 1.500 soldados estacionados en el país. Malí y Burkina Faso, ambos bajo gobiernos militares, expresaron su apoyo solidario a la junta nigeriana.

Los tres países forman ahora una franja de gobiernos militares que controla el corazón del Sahel, con implicaciones directas para la lucha contra el terrorismo yihadista y la influencia geopolítica de Francia, Rusia y China en la región.""",

    'SIG-2025-005': """Tras 25 años de negociaciones, el Mercosur y la Unión Europea firmaron el acuerdo comercial más ambicioso en la historia de ambos bloques, cubriendo una zona de libre comercio que abarca a más de 780 millones de personas.

El acuerdo elimina aranceles al 90% de los productos europeos exportados al Mercosur y al 82% de los productos sudamericanos exportados a la UE. Se estima que el acuerdo podría incrementar el comercio bilateral en 40.000 millones de dólares anuales.

Sin embargo, el acuerdo enfrenta oposición significativa. En Europa, productores agrícolas de Francia, Polonia e Irlanda temen una invasión de productos baratos. En América Latina, organizaciones ambientalistas advierten que el acuerdo profundizará la deforestación amazónica y precarizará las condiciones laborales.""",

    'SIG-2025-006': """La ONU confirmó que India ha superado oficialmente a China como el país más poblado del mundo, con 1.428 millones de habitantes frente a los 1.425 millones de China. Este hito demográfico marca un punto de inflexión en la historia moderna de Asia.

India experimenta un dividendo demográfico favorable: el 65% de su población tiene menos de 35 años, mientras que China enfrenta un envejecimiento acelerado. Esta ventaja demográfica posiciona a India como el principal competidor de China en la manufactura global y los servicios tecnológicos.

Sin embargo, el crecimiento demográfico indio presenta desafíos: la necesidad de crear 12 millones de empleos anuales, la presión sobre recursos hídricos y la tensión social derivada de la desigualdad de ingresos.""",

    'SIG-2025-007': """El llenado de la Gran Presa Renacentista (GDR) de Etiopía ha elevado las tensiones entre Etiopía y Egipto a niveles sin precedentes. El presidente egipcio el-Sisi advirtió que todas las opciones están sobre la mesa para proteger el acceso al Nilo, que aporta el 90% del agua dulce de Egipto.

Etiopía rechaza cualquier injerencia externa, considerando el proyecto fundamental para electrificar al 60% de su población sin acceso a la red eléctrica. El primer ministro Abiy Ahmed calificó la posición egipcia de neocolonial.

Sudán ha tomado una posición ambivalente, recibiendo ofertas de ambos lados. Expertos de la ONU advierten que un conflicto por el agua podría generar una crisis humanitaria que afecte a más de 300 millones de personas.""",

    'SIG-2025-008': """Rusia anunció el despliegue operativo de misiles hipersónicos Avangard en la región de Kaliningrado. Los misiles, capaces de alcanzar velocidades de Mach 27 y maniobrar en vuelo para evadir defensas antimisiles, representan la punta de lanza del arsenal estratégico ruso.

La OTAN calificó el despliegue de escalada inaceptable y amenaza directa a la seguridad de todos los miembros de la alianza. El secretario general anunció refuerzo de defensas en los países bálticos y baterías Patriot adicionales en Polonia y Rumania.

El Kremlin justificó la medida como respuesta simétrica al aumento de presencia militar de la OTAN en Europa del Este. Kaliningrado ha sido convertida en una fortaleza militar con capacidad nuclear táctica, modificando el equilibrio estratégico en el Báltico.""",

    'SIG-2025-009': """La RDC y China firmaron un acuerdo minero de 10 años por la explotación de cobalto en Lualaba, valorado en 15.000 millones de dólares. El cobalto es esencial para baterías de ion-litio, vehículos eléctricos y almacenamiento de energía renovable. La RDC posee el 70% de las reservas mundiales y China controla el 80% del refinado global.

Amnistía Internacional documentó condiciones laborales inaceptables, incluyendo trabajo infantil y exposición a metales tóxicos. El presidente Tshisekedi prometió cláusulas de responsabilidad social más estrictas, pero activistas locales expresan escepticismo.""",

    'SIG-2025-010': """El Congreso Nacional de Brasil aprobó la Ley de Soberanía Digital con 312 votos a favor y 148 en contra, exigiendo que Meta, Google, Amazon, Microsoft y TikTok almacenen datos de usuarios brasileños dentro del territorio y paguen compensación por uso de datos personales.

La ley establece multas de hasta el 10% de la facturación global para empresas que incumplan. Crea un Ente Regulador de Datos con poder para auditar algoritmos y exigir transparencia en moderación de contenido.

Las empresas tecnológicas estadounidenses calificaron la ley de discriminatoria. La Unión Europea e India expresaron interés en adoptar modelos similares, señalando un cambio de paradigma global en la gobernanza de datos tecnológicos.""",

    'SIG-2025-011': """El restablecimiento de relaciones diplomáticas entre Arabia Saudita e Irán, mediado por China, genera transformaciones profundas en Medio Oriente. Riad reabrió su embajada en Teherán y ambos países establecieron canales de comunicación militar directa.

Arabia Saudita ha comenzado a desvincular su política exterior de la alineación automática con Washington, especialmente en la cuestión palestina. El acuerdo incluye inversiones chinas de 50.000 millones de dólares en infraestructura.

Para Israel, el acercamiento saudí-iraní representa un revés estratégico que complica sus planes de normalización con Riad y altera el equilibrio de poder regional.""",

    'SIG-2025-012': """Miles de kenyans se manifestaron contra el Acuerdo de Asociación Económica firmado con China, argumentando que reproduce patrones de dependencia neocolonial y beneficia desproporcionadamente a empresas chinas.

El acuerdo facilita la entrada de productos manufacturados chinos a cambio de acceso a recursos naturales. Los manifestantes señalan que la diplomacia de infraestructura china ha dejado a países africanos endeudados sin beneficios prometidos.

Analistas del Instituto Africano de Política Económica advierten que el comercio bilateral es cada vez más asimétrico: Kenia exporta materias primas mientras importa productos manufacturados, perpetuando una relación colonial.""",

    'SIG-2025-013': """El Parlamento Europeo aprobó la Ley de Inteligencia Artificial (AI Act), la primera regulación integral de IA en el mundo. La ley establece un sistema de clasificación por riesgos: riesgo inaceptable (prohibidas), riesgo alto (reguladas estrictamente), riesgo limitado (transparencia) y riesgo mínimo.

Las aplicaciones prohibidas incluyen sistemas de puntuación social, manipulación subliminal, biometría masiva en tiempo real y predicción policial basada en perfiles étnicos.

Startups francesas y alemanas temen que la regulación asfixie la innovación. Sin embargo, Brasil, India y Sudáfrica han expresado interés en adoptar modelos similares, estableciendo a Europa como estándar global de gobernanza de IA.""",

    'SIG-2025-014': """La presidenta de México firmó el decreto de nacionalización del litio, creando la Empresa Nacional del Litio (LitioMx). México posee reservas estimadas de 1.7 millones de toneladas, esenciales para la transición energética global.

La medida generó fricciones con corporaciones canadienses, chinas y surcoreanas. Bolivia y Argentina, los otros dos países del triángulo del litio, han mostrado interés en coordinar políticas de soberanía sobre el mineral.

China, principal consumidor mundial de litio, expresó preocupación por la medida. Estados Unidos evalúa recurrir a mecanismos de disputa del USMCA para proteger las inversiones de sus empresas en el sector.""",

    'SIG-2025-015': """En la Cumbre del Clima de África en Nairobi, los 54 países del continente exigieron compensaciones climáticas de 500.000 millones de dólares anuales. África contribuye con menos del 4% de las emisiones globales pero sufre desproporcionadamente sus consecuencias.

La declaración establece que las compensaciones deben considerarse reparaciones por daños causados por más de un siglo de emisiones industriales occidentales, no ayuda humanitaria.

La UE y EE.UU. rechazaron la cifra, ofreciendo 100.000 millones anuales. China respaldó la posición africana y se comprometió a contribuir con 30.000 millones anuales a través del Banco de los BRICS.""",

    'SIG-2025-016': """El Departamento de Comercio de EE.UU. anunció nuevas restricciones a la exportación de semiconductores avanzados a China, prohibiendo la venta de chips de 7nm o menos y equipos de litografía avanzada.

La medida afecta a SMIC y Huawei. Se estima que podría retrasar la industria de semiconductores china entre tres y cinco años. China amenazó con restricciones a la exportación de galio, germanio y tierras raras.

Empresas de Corea del Sur, Japón y Taiwán se encuentran atrapadas entre las presiones de Washington y su dependencia del mercado chino.""",

    'SIG-2025-017': """La OHCHR publicó un informe de 120 páginas documentando violaciones sistemáticas de derechos humanos en Xinjiang. El informe detalla centros de detención con entre 200.000 y un millón de personas, principalmente uigures, y políticas de asimilación forzada.

China rechazó el informe, calificándolo de falso y manipulado por fuerzas anti-chinas. La cuestión generó nuevas tensiones diplomáticas, con la UE pidiendo sanciones y China amenazando con represalias económicas.""",

    'SIG-2025-018': """La disputa territorial entre Venezuela y Guyana por el Esequibo se intensificó tras el descubrimiento de 3.000 millones de barriles adicionales de crudo en aguas disputadas. ExxonMobil opera bajo licencia de Guyana.

Maduro convocó un referéndum donde, según resultados oficiales cuestionados, el 95% votó a favor de reclamar la soberanía. CARICOM respaldó la posición guyanesa de resolver la disputa mediante la CIJ.

Brasil reforzó su presencia militar en la frontera norte. EE.UU. aumentó ejercicios militares con Guyana, mientras Rusia expresó apoyo al derecho venezolano de defender su soberanía territorial.""",

    'SIG-2025-019': """Los EAU anunciaron una inversión de 20.000 millones de dólares en hidrógeno verde, el mayor compromiso de un país del Golfo en diversificación energética. El plan prevé 15 plantas de electrolisis alimentadas por energía solar.

El proyecto busca posicionar a los EAU como líder mundial en producción y exportación de hidrógeno verde. Para 2035 se estima una producción de 1,4 millones de toneladas anuales, reduciendo 10 millones de toneladas de emisiones de CO2.

La UE firmó un memorando para importar hidrógeno emiratí. Japón y Corea del Sur expresaron interés. La iniciativa reduce la dependencia de las exportaciones de petróleo y establece una nueva relación energética con Europa.""",

    'SIG-2025-020': """La OTAN inauguró su base más septentrional en Evenes, Noruega, a 200 km de la frontera rusa. La base alberga 1.200 soldados, aviones F-35, radares de alerta temprana y sistemas de guerra electrónica.

El Ártico se ha convertido en nuevo teatro de competición por el derretimiento del hielo polar, que abre rutas marítimas y acceso a petróleo, gas y minerales raros. Rusia reforzó su presencia con 14 nuevas bases.

China se declaró Estado cercano al Ártico y desplegó rompehielos de investigación. Rusia y China realizaron patrullas navales conjuntas en la región.""",

    'SIG-2025-021': """Argentina anunció la suspensión de pagos al FMI (44.000 millones de dólares, la mayor deuda del organismo con un país individual) y buscará financiamiento alternativo con China y los BRICS.

El ministro de Economía anunció que Argentina dejará de usar el dólar como moneda de referencia y adoptará una canasta con yuan, real y peso. Se acelerará la adhesión formal al bloque BRICS+.

Brasil, China y Sudáfrica expresaron su apoyo. El FMI advirtió sobre consecuencias para el acceso a crédito internacional. El caso argentino podría sentar precedente para otros países del Sur Global endeudados.""",

    'SIG-2025-022': """Las fuerzas de resistencia en Myanmar lograron los mayores avances territoriales contra la junta militar desde el golpe de 2021. La coalición controla gran parte del norte de Shan, oeste de Rakhine y partes de Sagaing.

Los avances incluyen la captura de Lashio, ciudad estratégica en la ruta comercial China-Myanmar. La junta perdió control de al menos 15 ciudades y más de 200 puestos de avanzada.

China adoptó postura ambivalente. La crisis generó 2,5 millones de desplazados internos. Las Naciones Unidas advierten de catástrofe humanitaria inminente.""",

    'SIG-2025-023': """Colombia y Ecuador firmaron el Acuerdo de Conservación Amazónica Transfronteriza, estableciendo un corredor de 8 millones de hectáreas. El acuerdo es innovador en su mecanismo de financiamiento con bonos de carbono verificados por la ONU.

El corredor almacena 2.800 millones de toneladas de CO2, valorado en el mercado internacional de carbono. El financiamiento inicial de 350 millones proviene del CAF, Fondo Verde para el Clima y fondos soberanos de Noruega y Alemania.

Las comunidades indígenas y afrocolombianas participarán en la gobernanza del corredor con representación directa en el consejo administrativo.""",

    'SIG-2025-024': """La propuesta alemana de un gasoducto desde Argelia generó fractura en la UE. Alemania, Italia y España apoyan el proyecto para diversificar fuentes energéticas. Francia y Polonia se oponen, argumentando que repite errores del Nord Stream y crea dependencia unilateral.

Argelia condiciona el acuerdo a concesiones sobre el Sahara Occidental. Rusia ofreció financiamiento a través de Gazprom, generando sospechas. El debate revela fracturas estructurales de la UE en política energética.""",

    'SIG-2025-025': """La cumbre del MNOAL en Kampala aprobó la Declaración de Kampala con tres ejes: soberanía digital, reforma del sistema financiero internacional y justicia climática.

La declaración exige un marco regulatorio multilateral para la gobernanza de internet y la reforma del FMI y Banco Mundial para eliminar el sesgo occidental en la distribución de cuotas de voto.

China, India y Sudáfrica jugaron un papel mediador clave. La ONU expresó respaldo a las demandas de reforma financiera.""",

    'SIG-2025-026': """Canadá anunció una moratoria de 10 años a la minería en el Ártico, respondiendo a décadas de resistencia de las Primeras Naciones, los Inuit y los Métis. La moratoria cubre 2,1 millones de km² donde se planificaban proyectos por 200.000 millones de dólares.

Las organizaciones indígenas celebraron la decisión como hito histórico en la reconciliación. Sin embargo, la industria minera advirtió que podría hacer retroceder el desarrollo económico del norte.""",

    'SIG-2025-027': """Turquía restringió el tránsito de buques de guerra por los Estrechos, reinterpretando la Convención de Montreux de 1936. La medida prohíbe el paso de buques de guerra de países sin costa en el Mar Negro.

La OTAN expresó profunda preocupación. Rusia calificó la decisión de prudente. Ucrania solicitó reunión de emergencia del Consejo de la OTAN.""",

    'SIG-2025-028': """La CIJ emitió nuevas medidas provisionales contra Israel en el caso por presunto genocidio en Gaza. La orden exige cesar operaciones en Rafah y permitir entrada de ayuda humanitaria sin restricciones. Adoptada por 13 votos a favor y 2 en contra.

Israel rechazó la decisión. EE.UU. bloqueó resolución del Consejo de Seguridad para hacerla cumplir. España, Irlanda y Noruega anunciaron sanciones unilaterales si Israel no cumple.""",

    'SIG-2025-029': """Colombia creó el Banco de Desarrollo Andino con capital de 7.000 millones de dólares (Ecuador: 2.500M, Perú: 2.000M, Bolivia: 500M). El banco financia proyectos sin condicionamientos del FMI ni Banco Mundial.

La gobernanza se basa en un país, un voto. Las tasas de interés serán 30-50% inferiores a las del mercado internacional. China expresó interés en cooperar. EE.UU. advirtió sobre riesgos de sostenibilidad.""",

    'SIG-2025-030': """Manifestações massivas irromperam no Paraguai após o governo autorizar despejos de 5.000 famílias camponesas em favor de extensões de monocultura de soja de corporações multinacionais como Cargill e Monsanto.

Os camponeses denunciam violência policial excessiva, incluindo gases lacrimogêneos e prisões arbitrárias. A ONU pediu a suspensão imediata dos despejos. O caso revela a tensão entre o agronegócio transnacional e comunidades camponesas no Cone Sul.""",

    'SIG-2025-031': """Cuba inaugurou sua rede 5G desenvolvida com Huawei e Rostelecom, cobrindo Havana, Varadero, Santiago de Cuba e Santa Clara. O projeto de 800 milhões de dólares usa tecnologia openRAN.

EE.UU. incluiu engenheiros cubanos e empresas russas em sua lista de sanções OFAC. Venezuela e Nicarágua expressaram interesse em tecnologia similar. O governo cubano declarou que nenhuma sanção deterá seu direito à conectividade.""",

    'SIG-2025-032': """Incêndios florestais na Amazônia boliviana atingiram 34.000 focos de calor em abril, destruindo 800.000 hectares. Pior abril desde 1998, superando a média histórica em 300%.

Fumaça tóxica afetou 15 milhões de pessoas no Brasil, Peru e Paraguai. Níveis de PM2.5 chegaram a 12 vezes o limite da OMS. O governo culpou o El Niño e queimadas ilegais, mas ambientalistas apontam a desregulação de 2024 como causa principal.""",

    'SIG-2025-033': """A CELAC e a ASEAN firmaram o Mecanismo de Diálogo Estratégico Permanente em Jacarta. O acordo estabelece reuniões ministeriais anuais, grupos de trabalho e um fundo de cooperação de 500 milhões de dólares.

Espera-se que o comércio bilateral, atualmente em 280 bilhões de dólares, cresça 25% em cinco anos. Analistas veem o acordo como reflexo da autonomia crescente do Sul Global na configuração de sua própria arquitetura de cooperação.""",

    'SIG-2025-034': """Rusia y Serbia realizaron ejercicios militares conjuntos "Slavic Brotherhood 2026" cerca de la frontera con Kosovo, con 5.000 soldados en total. Incluyeron simulaciones de combate urbano y artillería pesada.

La OTAN elevó alerta en Kosovo. Serbia considera los ejercicios demostración de capacidad defensiva soberana. Rusia utiliza el conflicto como herramienta de influencia en los Balcanes.""",

    'SIG-2025-035': """Turkey restricted naval traffic through the Bosphorus Strait after Russia withdrew from the Black Sea Grain Initiative. The move threatens food supplies for 350 million people in 45 countries, particularly in Somalia, Yemen, Ethiopia and Afghanistan.

The UN World Food Programme warned of massive food security impacts. Russia defended Turkey's decision while Ukraine called for an emergency Security Council meeting. The EU announced 500 million euros in emergency food aid.""",

    'SIG-2025-036': """El parlamento húngaro aprobó la Ley de Protección de la Soberanía Migratoria, permitiendo expulsión sumaria de solicitantes de asilo sin apelación, centros de retorno en frontera y criminalización de organizaciones que asisten a migrantes.

El Comisionado Europeo de Derechos Humanos calificó la ley de violación directa de la Convención Europea de Derechos Humanos. La CE anunció procedimiento de infracción y posible suspensión de fondos por 7.500 millones de euros.""",

    'SIG-2025-037': """Turkmenistán y la UE firmaron un acuerdo para el Gasoducto Transcaspio, de 1.200 km y 25.000 millones de dólares, para reducir la dependencia europea del gas ruso. Turkmenistán posee la cuarta mayor reserva de gas natural del mundo.

Rusia se opone a infraestructura que compita con sus exportaciones. Irán reclamó parte del fondo marino del Caspio. Azerbaiyán se ofrece como hub de distribución. Fue la primera visita de un líder europeo de alto nivel a Turkmenistán en 15 años.""",

    'SIG-2025-038': """菲律宾与美国在南中国海启动大规模联合海上巡逻，部署两艘航母战斗群和多架巡逻机。中国外交部表示强烈抗议并派遣海警船只跟踪监视。

南海每年承载超过3.4万亿美元的全球贸易额。紧张局势升级导致地区国家增加军费：菲律宾2025年国防预算增长18%。多国外交官呼吁通过《南海行为准则》解决争端，但中国坚持双边谈判，拒绝多边框架。""",

    'SIG-2025-039': """中国正式宣布京非量子通信干线建成开通，连接北京与内罗毕，全长超过一万五千公里。采用卫星和光纤混合量子密钥分发技术，实现理论上无法破解的端到端加密通信。

印度、日本和韩国对此表示关切，担心中国利用量子通信在非洲扩大影响力。美国国防部加速与日本、澳大利亚和印度的联合量子技术研发项目。非洲联盟对该基础设施表示欢迎。""",

    'SIG-2025-040': """India inaugurated its first advanced semiconductor fab in Gujarat, built by Tata-TSMC joint venture with $12 billion investment, becoming the world's third-largest chip manufacturer. The fab produces 5nm and 3nm chips.

US supports India's semiconductor development through the CHIPS Act with $2.5 billion in subsidies. However, analysts note India faces challenges in infrastructure, talent shortage and water resources — each chip requires thousands of gallons of ultra-pure water.""",

    'SIG-2025-041': """Pakistan and China accelerated construction of the CPEC gas pipeline connecting Gwadar Port to Xinjiang. The 2,700 km pipeline is one of the Belt and Road Initiative's most strategic infrastructure projects.

Baloch separatist attacks have killed over 60 workers. Construction costs escalated from $2.5 billion to over $6 billion. The IMF warned about Pakistan's worsening debt sustainability. China reaffirmed its firm support for the project.""",

    'SIG-2025-042': """North Korea announced deployment of tactical nuclear weapons at five locations near the DMZ, the most aggressive nuclear posture shift since the 1953 armistice. Mobile launch platforms carry warheads with 10-50 kiloton yields.

South Korea activated Aegis missile defense systems. The US reaffirmed extended deterrence commitments. China issued a rare statement urging restraint. The IAEA expressed concern about lack of verification mechanisms.""",

    'SIG-2025-043': """أعلنت محكمة العدل الدولية فتح تحقيق رسمي في مزاعم الإبادة الجماعية في دارفور بناء على شكوى من دول أفريقية بدعم من الاتحاد الأفريقي. التقرير يوثق 12 ألف حالة قتل وأكثر من 800 ألف نازح.

السودان رفض القرار واصفا إياه بتدخل سافر. جنوب السودان أعلن استعداده لاستضافة مفاوضات سلام. منظمة العفو الدولية دعت لفرض حظر عاجل على توريد الأسلحة للسودان.""",

    'SIG-2025-044': """Zambia inició negociaciones con China para reestructurar su deuda de 6.800 millones de dólares, convirtiéndose en caso testigo para África subsahariana. Se busca reducir el valor presente en un 40% y extender plazos a 25 años.

China, que posee el 30% de la deuda, condiciona la renegociación a la continuación de proyectos de infraestructura. Economistas señalan que el caso revela la complejidad de la arquitectura de deuda del continente con múltiples acreedores.""",

    'SIG-2025-045': """La Gran Muralla Verde anunció que ha restaurado el 20% de la meta de 100 millones de hectáreas, alcanzando 20 millones en 11 países del Sahel. Los países con mayores avances son Etiopía (6,5M), Níger (4,2M) y Nigeria (3,1M).

Investigadores advierten que el ritmo actual es insuficiente frente a una desertificación de 12 millones de hectáreas por año. Comunidades locales denuncian falta de participación y priorización de especies comerciales sobre sistemas agrícolas tradicionales.""",

    'SIG-2025-046': """A junta do Mali ordenou a expulsão imediata da MINUSMA (13.000 soldados) e o fechamento da última base francesa em Gao, marcando o ponto culminante da viragem em direção à Rússia e ao Grupo Wagner.

A ONU expressou grave preocupação pelo vácuo de segurança na região norte, onde grupos jihadistas continuam ativos. A Rússia celebrou a decisão como fim da interferência neocolonial. A CEDEAO suspendeu o Mali de suas atividades.""",

    'SIG-2025-047': """Mozambique renovó el acuerdo con fuerzas ruandesas en Cabo Delgado contra la insurgencia yihadista. El renovado acuerdo prevé 1.500 soldados ruandeses por tres años más, financiamiento compartido entre Mozambique, la UA y la UE.

Críticos señalan que la dependencia de fuerzas extranjeras socava la capacidad institucional mozambiqueña y crea precedentes peligrosos para la soberanía africana.""",

    'SIG-2025-048': """شهد اليمن تصعيداً عسكرياً خطيراً إثر هجمات صاروخية حوثية على منشآت نفطية سعودية. ردت الرياض بقصف جوي مكثف أدى لمقتل أكثر من 80 مدنياً. الأمم المتحدة حذرت من انهيار الهدنة المبرمة عام 2022.

21,6 مليون يمني يحتاجون مساعدات إنسانية عاجلة. الولايات المتحدة أعربت عن قلقها العميق لكن الحوثيين رفضوا دعوات إحياء مفاوضات السلام.""",

    'SIG-2025-049': """Irán inauguró la mayor planta solar de Medio Oriente en Kerman (2 GW), construida con tecnología principalmente iranía. El proyecto "Sol de Kerman" cubre 3.200 hectáreas y es parte de la estrategia para generar 20% de electricidad renovable para 2030.

Irán utilizó swap petrolero con India, inversión del Banco de Desarrollo de China y empresas privadas iranías. Expertos de Oxford señalan que el modelo iraní de desarrollo solar bajo sanciones podría replicarse en otros países del Sur Global.""",

    'SIG-2025-050': """Saudi Arabia and Iran established a Joint Persian Gulf Maritime Security Framework, creating a joint command center for maritime surveillance, search and rescue, and counter-piracy patrols. Both commit to resolving incidents through a bilateral hotline.

The US expressed cautious optimism but voiced concern about exclusion of other Gulf states. China offered technical support. Analysts at IISS described it as the most significant restructuring of Gulf security architecture since 1945.""",

    'SIG-2025-051': """Qatar presentó una plataforma de pagos digitales basada en blockchain para los países árabes. La plataforma, denominada "Dirham Digital", busca crear un ecosistema de pagos interoperable entre los 22 estados miembros de la Liga Árabe, reduciendo la dependencia de los sistemas SWIFT y Visa occidentales.

El Banco Central de Qatar, que lidera el desarrollo, aseguró que la plataforma cumple con los estándares del Banco de Pagos Internacionales (BIS) y que ha sido auditada por firmas internacionales independientes. Se espera que la plataforma esté operativa para finales de 2027."""
}

count = 0
for sig_id, fc in full_contents.items():
    # Find each occurrence of the signal and its fullContent
    # Pattern: look for the id, then find the nearest fullContent after it
    pattern = f"(id: '{sig_id}',.*?fullContent:) \"\""
    matches = list(re.finditer(pattern, content, re.DOTALL))
    if matches:
        for match in matches:
            old_text = match.group(0)
            # Get just the fullContent part
            fc_part = f"fullContent: \"{fc}\""
            new_text = old_text.replace('fullContent: ""', fc_part)
            content = content.replace(old_text, new_text, 1)
            count += 1
            print(f"  Updated {sig_id}")

print(f"\nTotal signals updated: {count}")

with open('/home/z/my-project/src/data/signals.ts', 'w') as f:
    f.write(content)

print("File saved successfully")
