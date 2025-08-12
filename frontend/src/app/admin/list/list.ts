import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ListNotification } from '../listnotification.interface';

const Test_Notification_Data: ListNotification[] = [
  {location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
  {location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
  {location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
  {location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
  {location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
];

@Component({
  selector: 'app-list',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class List implements AfterViewInit {
  displayedColumns: string[] = ['location', 'type', 'status', 'date'];
  dataSource = new MatTableDataSource(Test_Notification_Data);


  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
