import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notitie } from '@app/admin/features/dashboard-item/interfaces/notitie.interface';

@Injectable({
  providedIn: 'root'
})
export class NotitieService {
  constructor(private http: HttpClient) {}

  postNotitie(meldingId: number | null | undefined, body: Notitie) {
    return this.http.post('http://localhost:8080/api/notitie/' + meldingId, body)
  }
}
