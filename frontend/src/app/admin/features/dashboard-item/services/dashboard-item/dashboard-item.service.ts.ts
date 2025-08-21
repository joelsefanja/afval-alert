import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DashboardItemService {
  private itemSignal = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  fetchDetails(meldingId: number | null | undefined) {
    if (meldingId == null) return;

    this.http.get<any>('http://localhost:8080/api/melding/' + meldingId)
      .pipe(
        map(m => ({
          id: m.id,
          lat: m.lat,
          lon: m.lon,
          comment: m.comment,
          imageUrl: m.imageUrl,
          status: m.status,
          notities: m.notities,
          createdAt: m.createdAt
        }))
      )
      .subscribe(item => this.itemSignal.set(item));
  }

  get item() {
    return this.itemSignal;
  }
}