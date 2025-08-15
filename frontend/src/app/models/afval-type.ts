/**
 * Model voor de verschillende types afval die gedetecteerd kunnen worden.
 * Gebaseerd op officiële Nederlandse gemeente afvalcategorieën.
 * 
 * @enum AfvalType
 * @description Enum met alle mogelijke afvalcategorieën zoals gebruikt door Nederlandse gemeenten
 */
export enum AfvalType {
  /** Groente-, Fruit- en Tuinafval (GFT) - organisch afval */
  GFT = 'GFT-afval',
  /** Plastic, Metaal en Drankkartons (PMD) - recycleerbare verpakkingen */
  PMD = 'PMD-afval',
  /** Papier en Karton - recycleerbaar papierafval */
  PAPIER = 'Papier en Karton',
  /** Glas - glazen verpakkingen en containers */
  GLAS = 'Glas',
  /** Textiel - kleding en textielproducten */
  TEXTIEL = 'Textiel',
  /** Klein Chemisch Afval (KCA) - gevaarlijke stoffen */
  KCA = 'Klein Chemisch Afval',
  /** Elektrische en Elektronische Apparatuur (AEEA) */
  AEEA = 'Elektro-apparatuur',
  /** Restafval - niet-recycleerbaar huishoudelijk afval */
  RESTAFVAL = 'Restafval',
  /** Grof afval - grote huishoudelijke items */
  GROF = 'Grof afval',
  /** Zwerfafval - afval op straat of in natuur */
  ZWERFAFVAL = 'Zwerfafval'
}