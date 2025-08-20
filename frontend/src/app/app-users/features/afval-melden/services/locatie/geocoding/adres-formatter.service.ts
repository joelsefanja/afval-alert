import { Injectable } from '@angular/core';
import { FormattedAddress } from '@interfaces/locatie.interface';

@Injectable({
  providedIn: 'root'
})
export class AdresFormatterService {
  
  formatDetailedAddress(addressData: FormattedAddress, fallback: string): string {
    if (!addressData) return fallback;
    return `${addressData.street} ${addressData.houseNumber}, ${addressData.postalCode} ${addressData.city}`;
  }

  enrichLocationWithAddressData(locatieInfo: any, addressData: FormattedAddress): any {
    return {
      ...locatieInfo,
      address: this.formatDetailedAddress(addressData, locatieInfo.address),
      wijk: addressData?.wijk,
      buurt: addressData?.buurt,
      gemeente: addressData?.gemeente
    };
  }
}