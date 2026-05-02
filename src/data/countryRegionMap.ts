/**
 * Country → Geopolitical Region mapping.
 * Maps ISO 3166-1 numeric codes (as strings) to the 6 geopolitical regions
 * used by Monitor Geopolítico. Used by GeoMap to color countries on the
 * D3-geo TopoJSON world map.
 *
 * Source reference: Natural Earth 110m TopoJSON country IDs.
 */

import type { Region } from '@/types';

/**
 * Authoritative mapping of countries to geopolitical regions.
 * Keys are ISO 3166-1 numeric codes matching Natural Earth 110m TopoJSON `id` property.
 * Built in order of specificity: ME overrides ASIA for overlapping countries (Pakistan, etc.)
 */
export const COUNTRY_REGION_MAP: Record<string, Region> = buildCountryRegionMap();

function buildCountryRegionMap(): Record<string, Region> {
  const map: Record<string, Region> = {};

  // ── NORTEAMÉRICA ──
  const norteamerica = [
    '840', // United States
    '124', // Canada
    '484', // Mexico
  ];

  // ── LATINOAMÉRICA ──
  const latinoamerica = [
    '032', // Argentina
    '068', // Bolivia
    '076', // Brazil
    '152', // Chile
    '170', // Colombia
    '188', // Costa Rica
    '218', // Ecuador
    '222', // El Salvador
    '320', // Guatemala
    '328', // Guyana
    '340', // Honduras
    '558', // Nicaragua
    '591', // Panama
    '600', // Paraguay
    '604', // Peru
    '858', // Uruguay
    '862', // Venezuela
  ];

  // ── EUROPA ──
  const europa = [
    '008', // Albania
    '020', // Andorra
    '040', // Austria
    '056', // Belgium
    '100', // Bulgaria
    '191', // Croatia
    '196', // Cyprus
    '203', // Czechia
    '208', // Denmark
    '233', // Estonia
    '246', // Finland
    '250', // France
    '276', // Germany
    '300', // Greece
    '348', // Hungary
    '352', // Iceland
    '372', // Ireland
    '380', // Italy
    '428', // Latvia
    '440', // Lithuania
    '442', // Luxembourg
    '470', // Malta
    '492', // Monaco
    '499', // Montenegro
    '528', // Netherlands
    '578', // Norway
    '616', // Poland
    '620', // Portugal
    '642', // Romania
    '643', // Russia
    '674', // San Marino
    '688', // Serbia
    '703', // Slovakia
    '705', // Slovenia
    '724', // Spain
    '752', // Sweden
    '756', // Switzerland
    '804', // Ukraine
    '826', // United Kingdom
    '-99', // Northern Cyprus / Kosovo / Abkhazia (disputed territories)
  ];

  // ── ÁFRICA ──
  const africa = [
    '012', // Algeria
    '024', // Angola
    '204', // Benin
    '072', // Botswana
    '854', // Burkina Faso
    '108', // Burundi
    '120', // Cameroon
    '132', // Cape Verde
    '140', // Central African Republic
    '148', // Chad
    '174', // Comoros
    '175', // Mayotte
    '178', // Congo (Republic)
    '180', // DR Congo
    '384', // Côte d'Ivoire
    '262', // Djibouti
    '818', // Egypt
    '226', // Equatorial Guinea
    '232', // Eritrea
    '231', // Ethiopia
    '266', // Gabon
    '270', // Gambia
    '288', // Ghana
    '324', // Guinea
    '624', // Guinea-Bissau
    '404', // Kenya
    '426', // Lesotho
    '430', // Liberia
    '434', // Libya
    '450', // Madagascar
    '454', // Malawi
    '466', // Mali
    '478', // Mauritania
    '480', // Mauritius
    '504', // Morocco
    '508', // Mozambique
    '516', // Namibia
    '562', // Niger
    '566', // Nigeria
    '638', // Réunion
    '646', // Rwanda
    '686', // Senegal
    '690', // Seychelles
    '694', // Sierra Leone
    '706', // Somalia
    '710', // South Africa
    '728', // South Sudan
    '748', // Eswatini
    '729', // Sudan
    '768', // Togo
    '798', // Tunisia
    '800', // Uganda
    '716', // Zimbabwe
    '894', // Zambia
    '260', // French Southern Territories
  ];

  // ── MEDIO ORIENTE ──
  const medioOriente = [
    '275', // Palestine
    '364', // Iran
    '368', // Iraq
    '376', // Israel
    '400', // Jordan
    '414', // Kuwait
    '422', // Lebanon
    '512', // Oman
    '586', // Pakistan
    '634', // Qatar
    '682', // Saudi Arabia
    '760', // Syria
    '792', // Turkey
    '784', // United Arab Emirates
    '887', // Yemen
  ];

  // ── ASIA ──
  const asia = [
    '031', // Azerbaijan
    '048', // Bahrain
    '050', // Bangladesh
    '064', // Bhutan
    '096', // Brunei
    '104', // Myanmar
    '116', // Cambodia
    '144', // Sri Lanka
    '156', // China
    '158', // Taiwan
    '360', // Indonesia
    '392', // Japan
    '398', // Kazakhstan
    '408', // North Korea
    '410', // South Korea
    '417', // Kyrgyzstan
    '418', // Laos
    '458', // Malaysia
    '462', // Maldives
    '496', // Mongolia
    '524', // Nepal
    '608', // Philippines
    '699', // India
    '702', // Singapore
    '704', // Vietnam
    '762', // Tajikistan
    '764', // Thailand
    '795', // Turkmenistan
    '860', // Uzbekistan
  ];

  // Build map — ME takes precedence over ASIA for overlapping countries
  for (const id of norteamerica) map[id] = 'NORTEAMÉRICA';
  for (const id of latinoamerica) map[id] = 'LATINOAMÉRICA';
  for (const id of europa) map[id] = 'EUROPA';
  for (const id of africa) map[id] = 'ÁFRICA';
  for (const id of medioOriente) map[id] = 'MEDIO ORIENTE';
  for (const id of asia) {
    if (!map[id]) map[id] = 'ASIA';
  }

  return map;
}

/**
 * Region colors for the choropleth map.
 * Matching the reference image's categorical palette adapted to Meridian dark theme.
 */
export const regionChoroplethColors: Record<Region, { fill: string; stroke: string; hoverFill: string }> = {
  'NORTEAMÉRICA': {
    fill: 'rgba(59, 130, 246, 0.25)',
    stroke: 'rgba(59, 130, 246, 0.45)',
    hoverFill: 'rgba(59, 130, 246, 0.45)',
  },
  'LATINOAMÉRICA': {
    fill: 'rgba(168, 85, 247, 0.25)',
    stroke: 'rgba(168, 85, 247, 0.45)',
    hoverFill: 'rgba(168, 85, 247, 0.45)',
  },
  'EUROPA': {
    fill: 'rgba(34, 211, 238, 0.25)',
    stroke: 'rgba(34, 211, 238, 0.45)',
    hoverFill: 'rgba(34, 211, 238, 0.45)',
  },
  'ÁFRICA': {
    fill: 'rgba(34, 197, 94, 0.25)',
    stroke: 'rgba(34, 197, 94, 0.45)',
    hoverFill: 'rgba(34, 197, 94, 0.45)',
  },
  'MEDIO ORIENTE': {
    fill: 'rgba(249, 115, 22, 0.25)',
    stroke: 'rgba(249, 115, 22, 0.45)',
    hoverFill: 'rgba(249, 115, 22, 0.45)',
  },
  'ASIA': {
    fill: 'rgba(239, 68, 68, 0.25)',
    stroke: 'rgba(239, 68, 68, 0.45)',
    hoverFill: 'rgba(239, 68, 68, 0.45)',
  },
};
