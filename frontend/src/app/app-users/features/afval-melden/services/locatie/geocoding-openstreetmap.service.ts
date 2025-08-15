import { Injectable } from '@angular/core';
import { Observable, of, throwError, map, catchError } from 'rxjs';
import { IGeocodingServiceInterface, AdresInfo, LocatieResultaat, GEOCODING_SERVICE_TOKEN } from '../../interfaces/geocoding.interface';

@Injectable({
  providedIn: 'root'
})
export class GeocodingOpenStreetMapService implements IGeocodingServiceInterface {

  private readonly nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'afval-alert-groningen/1.0';

  getAdresVanCoordinaten(latitude: number, longitude: number): Observable<AdresInfo> {
    const url = `${this.nominatimBaseUrl}/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    return new Observable<AdresInfo>(observer => {
      fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const address = data.address || {};
        
        const adresInfo: AdresInfo = {
          volledigAdres: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          straat: address.road || '',
          huisnummer: address.house_number || '',
          postcode: address.postcode || '',
          plaats: address.city || address.town || address.village || '',
          land: address.country || 'Nederland'
        };
        
        observer.next(adresInfo);
        observer.complete();
      })
      .catch(error => {
        console.error('Nominatim reverse geocoding error:', error);
        observer.error(new Error('Adres kon niet worden opgehaald'));
      });
    });
  }

  getLocatieResultaat(latitude: number, longitude: number): Observable<LocatieResultaat> {
    return this.getAdresVanCoordinaten(latitude, longitude).pipe(
      map(adresInfo => {
        // Controleer of de locatie in Groningen ligt
        const isGroningen = adresInfo.plaats.toLowerCase().includes('groningen');
        const isProvincie = isGroningen;
        const isGemeente = isGroningen;
        const isStad = isGroningen;
        
        return {
          provincieGroningen: isProvincie,
          gemeenteGroningen: isGemeente,
          stadGroningen: isStad,
          wijk: '',
          volledigAdres: adresInfo.volledigAdres
        };
      }),
      catchError(error => {
        console.error('Fout bij ophalen locatie resultaat:', error);
        return throwError(() => new Error('Locatie informatie kon niet worden opgehaald'));
      })
    );
  }

  getCoordinatenVanAdres(adres: string): Observable<{ latitude: number; longitude: number }> {
    // Beperk zoekopdracht tot Groningen voor betere resultaten
    const zoekQuery = `${adres}, Groningen, Nederland`;
    const url = `${this.nominatimBaseUrl}/search?q=${encodeURIComponent(zoekQuery)}&format=json&countrycodes=NL&limit=1`;
    
    return new Observable<{ latitude: number; longitude: number }>(observer => {
      fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data || data.length === 0) {
          throw new Error('Adres niet gevonden');
        }
        
        const result = data[0];
        observer.next({
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        });
        observer.complete();
      })
      .catch(error => {
        console.error('Nominatim search error:', error);
        observer.error(new Error('Adres niet gevonden'));
      });
    });
  }

  isLocatieBinnenGroningen(latitude: number, longitude: number): Observable<boolean> {
    return this.analyseLocatie(latitude, longitude).pipe(
      map(result => result.provincieGroningen),
      catchError(() => of(false))
    );
  }

  /**
   * Analyseert locatie met behulp van OpenStreetMap Nominatim API
   */
  analyseLocatie(latitude: number, longitude: number): Observable<LocatieResultaat> {
    const url = `${this.nominatimBaseUrl}/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    return new Observable<LocatieResultaat>(observer => {
      fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const address = data.address || {};
        
        // Analyseer de verschillende administratieve niveaus
        const provincie = (address.state || '').toLowerCase();
        const gemeente = (address.county || address.municipality || '').toLowerCase();
        const stad = (address.city || address.town || '').toLowerCase();
        const wijk = address.suburb || address.neighbourhood;
        
        // Bouw volledig adres op uit componenten
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
          : data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        const result: LocatieResultaat = {
          provincieGroningen: provincie.includes('groningen'),
          gemeenteGroningen: gemeente.includes('groningen'),
          stadGroningen: stad === 'groningen',
          wijk: wijk || undefined,
          volledigAdres
        };
        
        console.log('Locatie analyse resultaat:', {
          ...result,
          debug: {
            provincie,
            gemeente,
            stad,
            rawAddress: address
          }
        });
        
        observer.next(result);
        observer.complete();
      })
      .catch(error => {
        console.error('Nominatim API error:', error);
        
        // Fallback: simpele coördinaten check voor Groningen provincie
        // Groningen provincie ligt ongeveer tussen deze coördinaten
        const groningenGrenzen = {
          noord: 53.5,
          zuid: 52.9,
          oost: 7.2,
          west: 6.1
        };
        
        const binnenGroningen = latitude >= groningenGrenzen.zuid &&
                               latitude <= groningenGrenzen.noord &&
                               longitude >= groningenGrenzen.west &&
                               longitude <= groningenGrenzen.oost;
        
        const fallbackResult: LocatieResultaat = {
          provincieGroningen: binnenGroningen,
          gemeenteGroningen: binnenGroningen,
          stadGroningen: false, // Kan niet bepalen zonder API
          wijk: undefined,
          volledigAdres: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        };
        
        observer.next(fallbackResult);
        observer.complete();
      });
    });
  }
}