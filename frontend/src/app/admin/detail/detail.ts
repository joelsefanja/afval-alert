import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  id: number | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
    });
  }
}