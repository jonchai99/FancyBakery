import { Injectable } from '@angular/core';
import { OrderItem } from './order-item.model';
import { OrderItemsQuery } from './order-items.query';
import { OrderItemsStore } from './order-items.store';

@Injectable({ providedIn: 'root' })
export class OrderItemsService {
  constructor(private orderItemsStore: OrderItemsStore, private orderItemsQuery: OrderItemsQuery) {}

  upsert(orderItem: OrderItem): void {
    const existingItems = this.orderItemsQuery.getAll({ filterBy: (entity) => entity.productCode === orderItem.productCode });
    if (existingItems.length > 0) {
      orderItem.id = existingItems[0].id;
      orderItem.quantity += existingItems[0].quantity;
    }

    this.orderItemsStore.upsert(orderItem.id, orderItem);
  }
}
