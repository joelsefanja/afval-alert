export interface AddressDetails {
  road?: string;
  house_number?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  [key: string]: any;
}

export interface FormattedAddress {
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  latitude?: number;
  longitude?: number;
  land: string;
  wijk?: string;
  buurt?: string;
  gemeente?: string;
  provincie?: string;
  rawAddress: AddressDetails;
}