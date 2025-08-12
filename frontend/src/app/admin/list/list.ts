import { AfterViewInit, Component, ViewChild, output } from '@angular/core';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ListNotification } from '../listnotification.interface';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { empty } from 'rxjs';


const Test_Notification_Data: ListNotification[] = [
  {id: 1, location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {id: 2,location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {id: 3,location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
  {id: 4,location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {id: 5,location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {id: 6,location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
  {id: 7,location: 1, type: 'Grofvuil', status: 'Opgehaald', date: '03/07/2025'},
  {id: 8,location: 2, type: 'Aluminium', status: 'Gepland', date: '06/07/2025'},
  {id: 9,location: 3, type: 'Hout', status: 'In Behandeling', date: '20/07/2025'},
];

@Component({
  selector: 'app-list',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, RouterModule],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ListComponent implements AfterViewInit {
  displayedColumns: string[] = ['location', 'type', 'status', 'date'];
  dataSource = new MatTableDataSource(Test_Notification_Data);

  clicked = output<Number>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
  private router: Router,
  private route: ActivatedRoute
  ) {}

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

  goToDetails(item: ListNotification) {
    this.clicked.emit(item.id);
    this.router.navigate(['details', item.id], { relativeTo: this.route });
}

}
