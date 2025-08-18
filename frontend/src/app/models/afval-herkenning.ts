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
    meldingId: string;
    locatie: {
        latitude: number;
        longitude: number;
    };
    contact?: {
        email?: string;
        naam?: string;
    };
}

export interface MeldingVerzendResponse {
    success: boolean;
}