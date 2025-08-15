import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, map, catchError } from 'rxjs';
import { IGeocodingServiceInterface, AdresInfo, LocatieResultaat, GEOCODING_SERVICE_TOKEN } from '../../interfaces/geocoding.interface';

@Injectable({
  providedIn: 'root'
})
export class GeocodingMockService implements IGeocodingServiceInterface {

  getLocatieResultaat(latitude: number, longitude: number): Observable<LocatieResultaat> {
    return this.getAdresVanCoordinaten(latitude, longitude).pipe(
      map(adresInfo => {
        // Alle mock locaties zijn in Groningen
        return {
          provincieGroningen: true,
          gemeenteGroningen: true,
          stadGroningen: true,
          wijk: 'Centrum',
          volledigAdres: adresInfo.volledigAdres
        };
      })
    );
  }

  private readonly mockAdressen: AdresInfo[] = [
    {
      volledigAdres: 'Grote Markt 1, 9712 HN Groningen',
      straat: 'Grote Markt',
      huisnummer: '1',
      postcode: '9712 HN',
      plaats: 'Groningen',
      land: 'Nederland'
    },
    {
      volledigAdres: 'Herestraat 73, 9711 GA Groningen',
      straat: 'Herestraat',
      huisnummer: '73',
      postcode: '9711 GA',
      plaats: 'Groningen',
      land: 'Nederland'
    },
    {
      volledigAdres: 'Vismarkt 20, 9711 KV Groningen',
      straat: 'Vismarkt',
      huisnummer: '20',
      postcode: '9711 KV',
      plaats: 'Groningen',
      land: 'Nederland'
    },
    {
      volledigAdres: 'Gedempte Zuiderdiep 98, 9711 HN Groningen',
      straat: 'Gedempte Zuiderdiep',
      huisnummer: '98',
      postcode: '9711 HN',
      plaats: 'Groningen',
      land: 'Nederland'
    },
    {
      volledigAdres: 'Noorderhaven 72, 9712 SG Groningen',
      straat: 'Noorderhaven',
      huisnummer: '72',
      postcode: '9712 SG',
      plaats: 'Groningen',
      land: 'Nederland'
    }
  ];

  // Groningen gemeente grenzen (ongeveer)
  private readonly groningenGrenzen = {
    noord: 53.3,
    zuid: 53.1,
    oost: 6.7,
    west: 6.4
  };

  getAdresVanCoordinaten(latitude: number, longitude: number): Observable<AdresInfo> {
    // Simuleer netwerk vertraging
    const verwerkingsTijd = Math.random() * 1000 + 500; // 0.5-1.5 seconden
    
    // Simuleer soms een fout
    if (Math.random() < 0.05) { // 5% kans op fout
      return throwError(() => new Error('Adres kon niet worden opgehaald')).pipe(
        delay(verwerkingsTijd)
      );
    }

    // Controleer of binnen Groningen
    if (!this.isCoordinaatBinnenGroningen(latitude, longitude)) {
      return throwError(() => new Error('Locatie ligt buiten gemeente Groningen')).pipe(
        delay(verwerkingsTijd)
      );
    }

    // Selecteer random adres (in echte implementatie zou dit gebaseerd zijn op coördinaten)
    const randomAdres = this.mockAdressen[Math.floor(Math.random() * this.mockAdressen.length)];
    
    return of(randomAdres).pipe(delay(verwerkingsTijd));
  }

  getCoordinatenVanAdres(adres: string): Observable<{ latitude: number; longitude: number }> {
    // Simuleer netwerk vertraging
    const verwerkingsTijd = Math.random() * 1000 + 500;
    
    // Simuleer soms een fout
    if (Math.random() < 0.1) { // 10% kans op fout
      return throwError(() => new Error('Adres niet gevonden')).pipe(
        delay(verwerkingsTijd)
      );
    }

    // Genereer random coördinaten binnen Groningen
    const latitude = this.groningenGrenzen.zuid + 
      Math.random() * (this.groningenGrenzen.noord - this.groningenGrenzen.zuid);
    const longitude = this.groningenGrenzen.west + 
      Math.random() * (this.groningenGrenzen.oost - this.groningenGrenzen.west);

    return of({ latitude, longitude }).pipe(delay(verwerkingsTijd));
  }

  isLocatieBinnenGroningen(latitude: number, longitude: number): Observable<boolean> {
    const binnenGrenzen = this.isCoordinaatBinnenGroningen(latitude, longitude);
    return of(binnenGrenzen).pipe(delay(200));
  }

  private isCoordinaatBinnenGroningen(latitude: number, longitude: number): boolean {
    return latitude >= this.groningenGrenzen.zuid &&
           latitude <= this.groningenGrenzen.noord &&
           longitude >= this.groningenGrenzen.west &&
           longitude <= this.groningenGrenzen.oost;
  }

  /**
   * Analyseert locatie met behulp van OpenStreetMap Nominatim API
   */
  analyseLocatie(latitude: number, longitude: number): Observable<LocatieResultaat> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    return new Observable<LocatieResultaat>(observer => {
      fetch(url, {
        headers: { 
          'User-Agent': 'afval-alert-groningen/1.0' 
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const address = data.address || {};
        
        const provincie = (address.state || '').toLowerCase();
        const gemeente = (address.county || address.municipality || '').toLowerCase();
        const stad = (address.city || address.town || '').toLowerCase();
        const wijk = address.suburb || address.neighbourhood;
        
        // Bouw volledig adres op
        const adresComponents = [];
        if (address.house_number && address.road) {
          adresComponents.push(`${address.road} ${address.house_number}`);
        } else if (address.road) {
          adresComponents.push(address.road);
        }
        if (address.postcode) {
          adresComponents.push(address.postcode);
        }
        if (address.city || address.town) {
          adresComponents.push(address.city || address.town);
        }
        
        const volledigAdres = adresComponents.length > 0 
          ? adresComponents.join(', ')
          : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        const result: LocatieResultaat = {
          provincieGroningen: provincie.includes('groningen'),
          gemeenteGroningen: gemeente.includes('groningen'),
          stadGroningen: stad === 'groningen',
          wijk: wijk || undefined,
          volledigAdres
        };
        
        observer.next(result);
        observer.complete();
      })
      .catch(error => {
        console.error('Nominatim API error:', error);
        
        // Fallback naar lokale check
        const binnenGroningen = this.isCoordinaatBinnenGroningen(latitude, longitude);
        const fallbackResult: LocatieResultaat = {
          provincieGroningen: binnenGroningen,
          gemeenteGroningen: binnenGroningen,
          stadGroningen: binnenGroningen,
          wijk: undefined,
          volledigAdres: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        };
        
        observer.next(fallbackResult);
        observer.complete();
      });
    }).pipe(
      delay(300) // Kleine vertraging voor UX
    );
  }
}