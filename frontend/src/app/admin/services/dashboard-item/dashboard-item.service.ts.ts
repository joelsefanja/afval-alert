import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { TijdlijnElement } from '../../interfaces/tijdlijn-element.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardItemServiceTs {
  private itemsSignal = signal<TijdlijnElement[]>([]);

  constructor(private http: HttpClient) {}

  fetchNotities(meldingId:number) {
    this.http.get<any[]>('http://localhost:8080/api/notities/' + meldingId)
      .pipe(
        map(notities =>
          notities.map(m => ({
            content: m.content,
            createdAt: m.createdAt
          }))
        )
      )
      .subscribe(list => this.itemsSignal.set(list));
  }

  get notifications() {
    return this.itemsSignal;
  }
}
