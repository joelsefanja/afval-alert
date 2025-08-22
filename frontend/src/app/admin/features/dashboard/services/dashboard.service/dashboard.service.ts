import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListNotification } from '../../interfaces/listnotification.interface';
import { map } from 'rxjs/operators';
import { LocatieService } from '@services/locatie/locatie.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private itemsSignal = signal<ListNotification[]>([]);

  constructor(
    private http: HttpClient,
    private locatieService: LocatieService
  ) {}

  fetchMeldingen() {
    this.http.get<any[]>('http://localhost:8080/api/meldingen') 
      .pipe(
        map(meldingen =>
          meldingen.map(m => ({
            id: m.id,
            lat: m.lat,
            lon: m.lon,
            wastetype: m.wastetypes?.map((w: any) => w.name).join(', ') || '',
            status: m.status,
            date: m.created_at ? new Date(m.created_at) : new Date(),
            // temporary placeholder until we fetch address
            location: `${m.lat}, ${m.lon}` 
          }))
        )
      )
      .subscribe(list => {
        this.itemsSignal.set(list);
        // After setting, enrich with addresses
        this.enrichWithAddresses();
      });
  }

  private async enrichWithAddresses() {
    const items = this.itemsSignal();
    const updated = await Promise.all(
      items.map(async item => {
        try {
        // Reverse geocode
        const response = await this.locatieService.reverseGeocode(item.lat, item.lon);
        
        // Use structured address if available
        const addr = response.address || {};
        const road_house_number = addr.road + ' ' + addr.house_number || '';
        const city = addr.city || addr.town || addr.village || '';
        const state = addr.state || '';
        
        // Build the formatted location string
        const locationParts = [road_house_number, city, state].filter(part => part); // remove empty parts
        const location = locationParts.join(', ');

        return { ...item, location };
      } catch {
          return item; // fallback to coordinates if geocoding fails
        }
      })
    );
    this.itemsSignal.set(updated);
  }

  get notifications() {
    return this.itemsSignal;
  }
}