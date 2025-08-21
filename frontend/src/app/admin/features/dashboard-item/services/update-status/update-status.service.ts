import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { State } from '@app/admin/features/dashboard/interfaces/state.interface';

@Injectable({
  providedIn: 'root'
})
export class UpdateStatusService {
  constructor(private http: HttpClient) {}

  updateStatus(meldingId:number | null | undefined, body: State) {
    this.http.put('http://localhost:8080/api/melding/status/' + meldingId, body)
      .subscribe({
        next: response => console.log('Status updated:', response),
        error: err => console.error('Error updating status:', err)
      })
  }
}
