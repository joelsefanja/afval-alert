import { Injectable } from '@angular/core';
import { FormattedAddress } from '@interfaces/locatie.interface';

/**
 * Service voor formatteren en verrijken van adresgegevens.
 * Kan in de toekomst opgesplitst worden:
 * - FormatterService: formatDetailedAddress
 * - LocatieVerrijkerService: enrichLocationWithAddressData
 */
@Injectable({ providedIn: 'root' })
export class AdresFormatterService {

  // ===== Formatteer volledig adres =====
  formatVolledigAdres(adresData: FormattedAddress, fallback: string): string {
    if (!adresData) return fallback;
    return `${adresData.street} ${adresData.houseNumber}, ${adresData.postalCode} ${adresData.city}`;
  }

  // ===== Verrijk locatie-object met adresinformatie =====
  verrijkLocatieMetAdres(locatie: any, adresData: FormattedAddress): any {
    return {
      ...locatie,
      address: this.formatVolledigAdres(adresData, locatie.address),
      wijk: adresData?.wijk,
      buurt: adresData?.buurt,
      gemeente: adresData?.gemeente
    };
  }
}
