import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListComponent } from './list/list';
import { DetailComponent } from './detail/detail';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ListComponent, DetailComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {
  selected = signal<any>(null);

  onSelected(id: Number) {
    this.selected.set(id);
  }

  onCloseDetail() {
    this.selected.set(null);
  }
}
