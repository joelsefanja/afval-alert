import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListNotification } from '../../interfaces/listnotification.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private itemsSignal = signal<ListNotification[]>([]);

  constructor(private http: HttpClient) {}

  fetchMeldingen() {
    this.http.get<any[]>('http://localhost:8080/api/meldingen') 
      .pipe(
        map(meldingen =>
          meldingen.map(m => ({
            id: m.id,
            location: `${m.lat}, ${m.lon}`, 
            type: m.trashType,
            status: m.status,
            date: m.created_at ? new Date(m.created_at) : new Date()
          }))
        )
      )
      .subscribe(list => this.itemsSignal.set(list));
  }

  get notifications() {
    return this.itemsSignal;
  }
}
