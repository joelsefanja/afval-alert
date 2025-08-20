export const TYPE_ORDER = [
  'GROFVUIL',
  'KLEINVUIL',
  'GLAS',
  'OVERIG',
  'HOUT',
  'ALUMINIUM'
];

export const STATUS_ORDER = [
  'NIEUW',
  'MELDINGVERWERKT',
  'WORDTOPGEHAALD',
  'OPGEHAALD'
];

export const TYPE_LABELS: Record<string, string> = {
  KLEINVUIL: 'Kleinvuil',
  GLAS: 'Glas',
  GROFVUIL: 'Grofvuil',
  OVERIG: 'Overig',
  HOUT: 'Hout',
  ALUMINIUM: 'Aluminium'
};

export const STATUS_LABELS: Record<string, string> = {
  NIEUW: 'Nieuw',
  MELDINGVERWERKT: 'Melding verwerkt',
  WORDTOPGEHAALD: 'Wordt opgehaald',
  OPGEHAALD: 'Opgehaald'
};

export function getReadableType(type: string): string {
  return TYPE_LABELS[type] || type;
}

export function getReadableStatus(status: string): string {
  return STATUS_LABELS[status] || status;
}