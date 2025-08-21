
export const STATUS_ORDER = [
  'NIEUW',
  'MELDINGVERWERKT',
  'WORDTOPGEHAALD',
  'OPGEHAALD'
];


export const STATUS_LABELS: Record<string, string> = {
  NIEUW: 'Nieuw',
  MELDINGVERWERKT: 'Melding verwerkt',
  WORDTOPGEHAALD: 'Wordt opgehaald',
  OPGEHAALD: 'Opgehaald'
};


export function getReadableStatus(status: string): string {
  return STATUS_LABELS[status] || status;
}