/**
 * seed-data-reales.ts
 * Poblamiento masivo de la base de datos con 3 clientes institucionales ficticios
 * (pero realistas) y sus contratos, etiquetas, temáticas y ejes de monitoreo.
 *
 * Ejecutar: bun run prisma/seed-data-reales.ts
 */

import { PrismaClient, TipoCombo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos reales...\n');

  // ──────────────────────────────────────────────
  // PASO A: Crear 3 Clientes Institucionales
  // ──────────────────────────────────────────────
  console.log('📋 Paso A: Creando clientes institucionales...');

  const aben = await prisma.cliente.create({
    data: {
      razonSocial: 'Agencia Boliviana de Energía Nuclear',
      sigla: 'ABEN',
      contacto: 'Director General',
      whatsapp: '59170000001',
      activo: true,
    },
  });

  const cainco = await prisma.cliente.create({
    data: {
      razonSocial: 'Cámara de Industria, Comercio, Servicio y Turismo de Santa Cruz',
      sigla: 'CAINCO',
      contacto: 'Gerente de Inteligencia',
      whatsapp: '59170000002',
      activo: true,
    },
  });

  const comibol = await prisma.cliente.create({
    data: {
      razonSocial: 'Corporación Minera de Bolivia',
      sigla: 'COMIBOL',
      contacto: 'Director de Planificación',
      whatsapp: '59170000003',
      activo: true,
    },
  });

  console.log(`  ✅ ABEN (ID: ${aben.id})`);
  console.log(`  ✅ CAINCO (ID: ${cainco.id})`);
  console.log(`  ✅ COMIBOL (ID: ${comibol.id})\n`);

  // ──────────────────────────────────────────────
  // PASO B: Crear Etiquetas Globales y Específicas
  // ──────────────────────────────────────────────
  console.log('🏷️  Paso B: Creando etiquetas...');

  const etiquetasData = [
    // ── Etiquetas globales (clienteId: null) ──
    { nombre: 'Pacto Fiscal', color: '#F97316', clienteId: null },
    { nombre: 'Tipo de Cambio', color: '#EAB308', clienteId: null },
    { nombre: 'Reservas', color: '#22C55E', clienteId: null },
    { nombre: 'Cooperativas', color: '#38BDF8', clienteId: null },
    { nombre: 'Nacionalización', color: '#EF4444', clienteId: null },
    { nombre: 'Rusia', color: '#8B5CF6', clienteId: null },

    // ── Etiquetas específicas de ABEN ──
    { nombre: 'YPFB', color: '#F97316', clienteId: aben.id },
    { nombre: 'Daroca', color: '#EF4444', clienteId: aben.id },
    { nombre: 'Gasolina', color: '#F59E0B', clienteId: aben.id },
    { nombre: 'Purga Laboral', color: '#DC2626', clienteId: aben.id },
    { nombre: 'Energía Nuclear', color: '#06B6D4', clienteId: aben.id },
    { nombre: 'Rosatom', color: '#6366F1', clienteId: aben.id },

    // ── Etiquetas específicas de COMIBOL ──
    { nombre: 'Litio', color: '#10B981', clienteId: comibol.id },
    { nombre: 'Mototaxistas', color: '#F472B6', clienteId: null }, // global
  ];

  // SQLite no soporta createMany con skipDuplicates — usamos create secuencial
  let etiquetasCount = 0;
  for (const etiquetaData of etiquetasData) {
    await prisma.etiqueta.create({ data: etiquetaData });
    etiquetasCount++;
  }

  console.log(`  ✅ ${etiquetasCount} etiquetas creadas`);

  // Recuperar todas las etiquetas para usar sus IDs
  const todasEtiquetas = await prisma.etiqueta.findMany();
  const etiquetaMap = new Map(todasEtiquetas.map((e) => [e.nombre, e.id]));
  console.log(`  📊 Total en BD: ${todasEtiquetas.length} etiquetas\n`);

  // ──────────────────────────────────────────────
  // PASO C: Crear Temáticas con sus etiquetas
  // ──────────────────────────────────────────────
  console.log('📂 Paso C: Creando temáticas...');

  const seisMeses = new Date();
  seisMeses.setMonth(seisMeses.getMonth() + 6);

  // Temática 1: Crisis YPFB → ABEN → [Daroca, YPFB, Gasolina, Purga Laboral]
  const crisisYPFB = await prisma.tematica.create({
    data: {
      nombre: 'Crisis YPFB',
      clienteId: aben.id,
      etiquetas: {
        create: [
          { etiquetaId: etiquetaMap.get('Daroca')! },
          { etiquetaId: etiquetaMap.get('YPFB')! },
          { etiquetaId: etiquetaMap.get('Gasolina')! },
          { etiquetaId: etiquetaMap.get('Purga Laboral')! },
        ],
      },
    },
  });
  console.log(`  ✅ Temática "${crisisYPFB.nombre}" (ID: ${crisisYPFB.id}) — 4 etiquetas`);

  // Temática 2: Energía Nuclear → ABEN → [Energía Nuclear, Rusia, Rosatom]
  const energiaNuclear = await prisma.tematica.create({
    data: {
      nombre: 'Energía Nuclear',
      clienteId: aben.id,
      etiquetas: {
        create: [
          { etiquetaId: etiquetaMap.get('Energía Nuclear')! },
          { etiquetaId: etiquetaMap.get('Rusia')! },
          { etiquetaId: etiquetaMap.get('Rosatom')! },
        ],
      },
    },
  });
  console.log(`  ✅ Temática "${energiaNuclear.nombre}" (ID: ${energiaNuclear.id}) — 3 etiquetas`);

  // Temática 3: Pacto Fiscal y Economía → CAINCO → [Pacto Fiscal, Tipo de Cambio, Reservas]
  const pactoFiscal = await prisma.tematica.create({
    data: {
      nombre: 'Pacto Fiscal y Economía',
      clienteId: cainco.id,
      etiquetas: {
        create: [
          { etiquetaId: etiquetaMap.get('Pacto Fiscal')! },
          { etiquetaId: etiquetaMap.get('Tipo de Cambio')! },
          { etiquetaId: etiquetaMap.get('Reservas')! },
        ],
      },
    },
  });
  console.log(`  ✅ Temática "${pactoFiscal.nombre}" (ID: ${pactoFiscal.id}) — 3 etiquetas`);

  // Temática 4: Cadena del Litio → COMIBOL → [Litio, Cooperativas, Nacionalización]
  const cadenaLitio = await prisma.tematica.create({
    data: {
      nombre: 'Cadena del Litio',
      clienteId: comibol.id,
      etiquetas: {
        create: [
          { etiquetaId: etiquetaMap.get('Litio')! },
          { etiquetaId: etiquetaMap.get('Cooperativas')! },
          { etiquetaId: etiquetaMap.get('Nacionalización')! },
        ],
      },
    },
  });
  console.log(`  ✅ Temática "${cadenaLitio.nombre}" (ID: ${cadenaLitio.id}) — 3 etiquetas\n`);

  // ──────────────────────────────────────────────
  // PASO D: Crear Contratos Activos
  // ──────────────────────────────────────────────
  console.log('📄 Paso D: Creando contratos activos...');

  const contratoABEN = await prisma.contrato.create({
    data: {
      clienteId: aben.id,
      tipoCombo: TipoCombo.PAQUETE_COMPLETO,
      estado: 'ACTIVO',
      instalacion: 'ENERGÍA CONNECT',
      fechaInicio: new Date(),
      fechaFin: seisMeses,
    },
  });
  console.log(`  ✅ Contrato ABEN: PAQUETE_COMPLETO → "ENERGÍA CONNECT" (vence: ${seisMeses.toISOString().split('T')[0]})`);

  const contratoCAINCO = await prisma.contrato.create({
    data: {
      clienteId: cainco.id,
      tipoCombo: TipoCombo.TERMO_SALDO,
      estado: 'ACTIVO',
      instalacion: 'MACRO CONNECT',
      fechaInicio: new Date(),
      fechaFin: seisMeses,
    },
  });
  console.log(`  ✅ Contrato CAINCO: TERMO_SALDO → "MACRO CONNECT" (vence: ${seisMeses.toISOString().split('T')[0]})`);

  const contratoCOMIBOL = await prisma.contrato.create({
    data: {
      clienteId: comibol.id,
      tipoCombo: TipoCombo.TERMOMETRO_SOLO,
      estado: 'ACTIVO',
      instalacion: 'MINERÍA CONNECT',
      fechaInicio: new Date(),
      fechaFin: seisMeses,
    },
  });
  console.log(`  ✅ Contrato COMIBOL: TERMOMETRO_SOLO → "MINERÍA CONNECT" (vence: ${seisMeses.toISOString().split('T')[0]})\n`);

  // ──────────────────────────────────────────────
  // PASO E: Crear Ejes de Monitoreo
  // ──────────────────────────────────────────────
  console.log('🎯 Paso E: Creando ejes de monitoreo...');

  // Eje ABEN: "Monitoreo Energético Integral" → Etiquetas [YPFB, Daroca, Gasolina] → Temática "Crisis YPFB"
  const ejeABEN = await prisma.ejeMonitoreo.create({
    data: {
      nombre: 'Monitoreo Energético Integral',
      contratoId: contratoABEN.id,
      tematicaId: crisisYPFB.id,
      etiquetas: {
        create: [
          { etiquetaId: etiquetaMap.get('YPFB')! },
          { etiquetaId: etiquetaMap.get('Daroca')! },
          { etiquetaId: etiquetaMap.get('Gasolina')! },
        ],
      },
      activo: true,
    },
  });
  console.log(`  ✅ Eje "${ejeABEN.nombre}" → Contrato ABEN → Temática: "Crisis YPFB" → Etiquetas: [YPFB, Daroca, Gasolina]`);

  // Eje CAINCO: "Indicadores Macroeconómicos" → Etiquetas [Pacto Fiscal, Tipo de Cambio]
  const ejeCAINCO = await prisma.ejeMonitoreo.create({
    data: {
      nombre: 'Indicadores Macroeconómicos',
      contratoId: contratoCAINCO.id,
      tematicaId: pactoFiscal.id,
      etiquetas: {
        create: [
          { etiquetaId: etiquetaMap.get('Pacto Fiscal')! },
          { etiquetaId: etiquetaMap.get('Tipo de Cambio')! },
        ],
      },
      activo: true,
    },
  });
  console.log(`  ✅ Eje "${ejeCAINCO.nombre}" → Contrato CAINCO → Temática: "Pacto Fiscal y Economía" → Etiquetas: [Pacto Fiscal, Tipo de Cambio]`);

  // Eje COMIBOL: "Conflictividad Minera" → Etiquetas [Litio, Cooperativas] → Temática "Cadena del Litio"
  const ejeCOMIBOL = await prisma.ejeMonitoreo.create({
    data: {
      nombre: 'Conflictividad Minera',
      contratoId: contratoCOMIBOL.id,
      tematicaId: cadenaLitio.id,
      etiquetas: {
        create: [
          { etiquetaId: etiquetaMap.get('Litio')! },
          { etiquetaId: etiquetaMap.get('Cooperativas')! },
        ],
      },
      activo: true,
    },
  });
  console.log(`  ✅ Eje "${ejeCOMIBOL.nombre}" → Contrato COMIBOL → Temática: "Cadena del Litio" → Etiquetas: [Litio, Cooperativas]\n`);

  // ──────────────────────────────────────────────
  // VERIFICACIÓN FINAL
  // ──────────────────────────────────────────────
  console.log('🔍 Verificación final:');

  const totalClientes = await prisma.cliente.count();
  const totalEtiquetas = await prisma.etiqueta.count();
  const totalTematicas = await prisma.tematica.count();
  const totalContratos = await prisma.contrato.count();
  const totalEjes = await prisma.ejeMonitoreo.count();

  console.log(`  Clientes:   ${totalClientes}`);
  console.log(`  Etiquetas:  ${totalEtiquetas}`);
  console.log(`  Temáticas:  ${totalTematicas}`);
  console.log(`  Contratos:  ${totalContratos}`);
  console.log(`  Ejes:       ${totalEjes}`);
  console.log('\n✅ Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
