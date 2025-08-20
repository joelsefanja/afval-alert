import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private _isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);
  
  constructor(private ngZone: NgZone) {
    this.initNetworkListeners();
  }
  
  /**
   * Geeft een observable die de online status bijhoudt
   */
  get isOnline$(): Observable<boolean> {
    return this._isOnline$.asObservable();
  }
  
  /**
   * Geeft de huidige online status
   */
  get isOnline(): boolean {
    return this._isOnline$.value;
  }
  
  /**
   * Initialiseert de event listeners voor online/offline status
   */
  private initNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.ngZone.run(() => this._isOnline$.next(true));
    });
    
    window.addEventListener('offline', () => {
      this.ngZone.run(() => this._isOnline$.next(false));
    });
  }
}