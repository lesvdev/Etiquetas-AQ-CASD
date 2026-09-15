export interface SgaPictogram {
  id: string; // 'GHS01', 'GHS02', etc.
  code: string;
  nombre: string;
  descripcion: string;
  simbolo: string;
  iconoClave: 'explosive' | 'flammable' | 'oxidizer' | 'gas' | 'corrosive' | 'toxic' | 'exclamation' | 'health' | 'environment';
}

export const SGA_PICTOGRAMS: SgaPictogram[] = [
  {
    id: 'GHS01',
    code: 'GHS01',
    nombre: 'Explosivo',
    descripcion: 'Peligro de explosión en masa o proyección',
    simbolo: '💥',
    iconoClave: 'explosive',
  },
  {
    id: 'GHS02',
    code: 'GHS02',
    nombre: 'Inflamable',
    descripcion: 'Gases, líquidos o sólidos inflamables / pirofóricos',
    simbolo: '🔥',
    iconoClave: 'flammable',
  },
  {
    id: 'GHS03',
    code: 'GHS03',
    nombre: 'Comburente / Oxidante',
    descripcion: 'Puede provocar o agravar un incendio',
    simbolo: '⭕🔥',
    iconoClave: 'oxidizer',
  },
  {
    id: 'GHS04',
    code: 'GHS04',
    nombre: 'Gas a Presión',
    descripcion: 'Gas comprimido, licuado o criogénico',
    simbolo: '🧯',
    iconoClave: 'gas',
  },
  {
    id: 'GHS05',
    code: 'GHS05',
    nombre: 'Corrosivo',
    descripcion: 'Provoca quemaduras graves en piel, lesiones oculares y corrosión en metales',
    simbolo: '⚗️🧪',
    iconoClave: 'corrosive',
  },
  {
    id: 'GHS06',
    code: 'GHS06',
    nombre: 'Toxicidad Aguda (Mortal)',
    descripcion: 'Mortal o muy tóxico en caso de ingestión, inhalación o contacto cutáneo',
    simbolo: '☠️',
    iconoClave: 'toxic',
  },
  {
    id: 'GHS07',
    code: 'GHS07',
    nombre: 'Nocivo / Irritante',
    descripcion: 'Irritación cutánea/ocular, sensibilización o toxicidad menor',
    simbolo: '❗',
    iconoClave: 'exclamation',
  },
  {
    id: 'GHS08',
    code: 'GHS08',
    nombre: 'Peligro para la Salud',
    descripcion: 'Carcinógeno, mutágeno, tóxico para la reproducción o por aspiración',
    simbolo: '👤🫁',
    iconoClave: 'health',
  },
  {
    id: 'GHS09',
    code: 'GHS09',
    nombre: 'Peligro Medio Ambiente',
    descripcion: 'Muy tóxico para los organismos acuáticos con efectos nocivos duraderos',
    simbolo: '🐟🌳',
    iconoClave: 'environment',
  },
];

export const COMMON_H_PHRASES = [
  { code: 'H225', text: 'Líquido y vapores muy inflamables' },
  { code: 'H272', text: 'Puede agravar un incendio; comburente' },
  { code: 'H290', text: 'Puede ser corrosivo para los metales' },
  { code: 'H301', text: 'Tóxico en caso de ingestión' },
  { code: 'H302', text: 'Nocivo en caso de ingestión' },
  { code: 'H314', text: 'Provoca quemaduras graves en la piel y lesiones oculares graves' },
  { code: 'H315', text: 'Provoca irritación cutánea' },
  { code: 'H318', text: 'Provoca lesiones oculares graves' },
  { code: 'H319', text: 'Provoca irritación ocular grave' },
  { code: 'H330', text: 'Mortal en caso de inhalación' },
  { code: 'H335', text: 'Puede irritar las vías respiratorias' },
  { code: 'H336', text: 'Puede provocar somnolencia o vértigo' },
  { code: 'H340', text: 'Puede provocar defectos genéticos' },
  { code: 'H350', text: 'Puede provocar cáncer' },
  { code: 'H360', text: 'Puede perjudicar la fertilidad o dañar al feto' },
  { code: 'H372', text: 'Provoca daños en los órganos tras exposiciones prolongadas' },
  { code: 'H400', text: 'Muy tóxico para los organismos acuáticos' },
  { code: 'H410', text: 'Muy tóxico para los organismos acuáticos, con efectos nocivos duraderos' },
];

export const COMMON_P_PHRASES = [
  { code: 'P210', text: 'Mantener alejado del calor, chispas, llamas abiertas y fuentes de ignición.' },
  { code: 'P260', text: 'No respirar el polvo / el humo / el gas / la niebla / los vapores / el aerosol.' },
  { code: 'P280', text: 'Llevar guantes, prendas, gafas y máscara de protección.' },
  { code: 'P301+P330+P331', text: 'EN CASO DE INGESTIÓN: Enjuagar la boca. NO provocar el vómito.' },
  { code: 'P302+P352', text: 'EN CASO DE CONTACTO CON LA PIEL: Lavar con abundante agua y jabón.' },
  { code: 'P304+P340', text: 'EN CASO DE INHALACIÓN: Transportar a la persona al aire libre y mantenerla en reposo.' },
  { code: 'P305+P351+P338', text: 'EN CASO DE CONTACTO CON LOS OJOS: Enjuagar con agua cuidadosamente durante varios minutos.' },
  { code: 'P310', text: 'Llamar inmediatamente a un CENTRO DE TOXICOLOGÍA o a un médico.' },
  { code: 'P403+P233', text: 'Almacenar en un lugar bien ventilado. Mantener el recipiente cerrado herméticamente.' },
  { code: 'P405', text: 'Guardar bajo llave.' },
  { code: 'P501', text: 'Eliminar el contenido/el recipiente en una instalación de residuos autorizada.' },
];
