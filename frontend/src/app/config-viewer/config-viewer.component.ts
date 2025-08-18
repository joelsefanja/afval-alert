import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocatieConfigService, LocatieConfig } from '../services/locatie-config.service';

@Component({
  selector: 'app-config-viewer',
  template: `
    <div class="config-viewer">
      <h2>Applicatie Configuratie</h2>
      <div *ngIf="config; else noConfig">
        <h3>Versie: {{config.versie}}</h3>
        
        <h4>Toegestane Gebieden:</h4>
        <ul>
          <li *ngFor="let gebied of config.toegestaneGebieden">
            <strong>{{gebied.naam}}</strong> ({{gebied.type}}) - {{gebied.land}}
          </li>
        </ul>
        
        <h4>Nominatim Instellingen:</h4>
        <ul>
          <li><strong>Base URL:</strong> {{config.nominatim.baseUrl}}</li>
          <li><strong>Reverse Zoom:</strong> {{config.nominatim.reverseZoom}}</li>
          <li><strong>Search Zoom:</strong> {{config.nominatim.searchZoom}}</li>
        </ul>
      </div>
      
      <ng-template #noConfig>
        <p>Configuratie kon niet worden geladen.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .config-viewer {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
      margin: 20px 0;
    }
    
    h2, h3, h4 {
      color: #333;
    }
    
    ul {
      list-style-type: none;
      padding: 0;
    }
    
    li {
      padding: 5px 0;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class ConfigViewerComponent implements OnInit {
  config: LocatieConfig | null = null;
  
  constructor(private locatieConfigService: LocatieConfigService) {}
  
  ngOnInit(): void {
    this.config = this.locatieConfigService.getConfig();
  }
}