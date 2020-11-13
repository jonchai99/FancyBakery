import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrderItemsStore, OrderItemsState } from './order-items.store';

@Injectable({ providedIn: 'root' })
export class OrderItemsQuery extends QueryEntity<OrderItemsState> {
  constructor(protected store: OrderItemsStore) {
    super(store);
  }
}
