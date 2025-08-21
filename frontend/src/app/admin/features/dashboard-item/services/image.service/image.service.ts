import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Image } from '../../../dashboard/interfaces/image.interface';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private itemSignal = signal<Image>({data: ""});

  constructor(private http: HttpClient) {}

  fetchImage(meldingId:number | null | undefined) {
    this.http.get('http://localhost:8080/api/image/' + meldingId, { responseType: 'blob'})
      .subscribe((blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.itemSignal.set({ data: objectURL });
      });
  }

  get notifications() {
    return this.itemSignal;
  }
}
