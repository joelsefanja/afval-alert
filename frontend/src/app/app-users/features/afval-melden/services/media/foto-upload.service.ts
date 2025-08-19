import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class FotoUploadService {
  private readonly imageUrl = 'http://localhost:8080/api/image';

  constructor(private http: HttpClient) {}

  public upload(image: Blob): Observable<any> {
    console.log("Uploading image...");
    const formData = new FormData();
    formData.append('file', image, 'image.jpg');

    return this.http.post(this.imageUrl, formData).pipe(
      tap((response) => {
        console.log("Image uploaded successfully:", response);
      }),
      catchError((error) => {
        console.error("Error uploading image:", error);
        return throwError(() => error);
      })
    );
  }
}
