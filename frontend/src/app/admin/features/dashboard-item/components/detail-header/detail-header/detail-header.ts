import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-detail-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-header.html',
  styleUrls: ['./detail-header.scss']
})
export class DetailHeaderComponent {
  @Input() status!: string;
  @Input() createdAt!: string; // ISO string from backend
  @Input() comment!: string;
}