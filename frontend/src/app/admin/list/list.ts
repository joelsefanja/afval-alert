import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';

export interface ListNotification {
  location: number;
  type: string;
  status: string;
}

const Test_Notification_Data: ListNotification[] = [
  {location: 3, type: 'Grofvuil', status: 'Opgehaald'},
  {location: 3, type: 'Aluminium', status: 'Gepland'},
  {location: 3, type: 'Hout', status: 'In Behandeling'},
];

@Component({
  selector: 'app-list',
  imports: [MatTableModule, MatSortModule],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class List implements AfterViewInit {
  displayedColumns: string[] = ['location', 'type', 'status'];
  dataSource = new MatTableDataSource(Test_Notification_Data);

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
      this.dataSource.sort = this.sort;
  }

}
