/**
 * Model voor de verschillende types afval die gedetecteerd kunnen worden.
 * Deze enum bevat alle mogelijke afvalcategorieën die het systeem kan herkennen.
 */
export enum AfvalType {
  PAPIER = 'Papier',
  PLASTIC = 'Plastic',
  GLAS = 'Glas',
  METAAL = 'Metaal',
  ORGANISCH = 'Organisch afval',
  RESTAFVAL = 'Restafval',
  GEVAARLIJK = 'Gevaarlijk afval',
  ELEKTRONISCH = 'Elektronisch afval'
}