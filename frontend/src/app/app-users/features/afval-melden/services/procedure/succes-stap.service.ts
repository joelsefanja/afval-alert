import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SuccesStapService {

  constructor() { }

  canInstallPWA: boolean = false;
  isInstalled: boolean = false;

  async promptPWAInstall() { }

  resetAndStart() { }

  closeApp() { }
}