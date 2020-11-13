import { Component, OnInit } from '@angular/core';
import { OrderItemsQuery } from '../state/order-items';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  dataSource$ = this.orderItemsQuery.selectAll();

  constructor(private orderItemsQuery: OrderItemsQuery) {}

  ngOnInit(): void {}
}
