export interface Locatie {
  latitude: number;
  longitude: number;
  address: string;
  wijk?: string;
  buurt?: string;
  gemeente?: string;
}

export interface FormattedAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  wijk?: string;
  buurt?: string;
  gemeente?: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
  formattedAddress?: FormattedAddress;
}

export interface SearchResult {
  address: string;
  lat: number;
  lng: number;
}

export interface Position {
  lat: number;
  lng: number;
}