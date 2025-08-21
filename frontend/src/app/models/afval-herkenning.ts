export interface AfvalType {
    id: string;
    naam: string;
    beschrijving: string;
    kleur: string;
    icoon: string;
}

// Request 1: Afbeelding uploaden en herkenning
export interface AfbeeldingUploadRequest {
    afbeelding: Blob;
}

export interface AfbeeldingUploadResponse {
    meldingId: string;
    afvalTypes: AfvalType[];
    weetje: string;
}

// Request 2: Melding verzenden met locatie en contact
export interface MeldingVerzendRequest {
    afbeeldingUrl: string;
    afvalTypes: any[];
    locatie?: {
        latitude: number;
        longitude: number;
        adres?: string;
    };
    contact?: {
        email?: string;
        naam?: string;
        telefoon?: string;
    };
}

export interface MeldingVerzendResponse {
    success: boolean;
    meldingId: string;
    message: string;
}