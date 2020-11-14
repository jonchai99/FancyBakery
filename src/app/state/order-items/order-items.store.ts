import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { findMinQuantity, Product, ProductsQuery } from '../products';
import { OrderItemDivision } from './order-item-division.model';
import { OrderItem } from './order-item.model';

export interface OrderItemsState extends EntityState<OrderItem> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'order-items',
})
export class OrderItemsStore extends EntityStore<OrderItemsState> {
  constructor(private productsQuery: ProductsQuery) {
    super();
    this.akitaPreAddEntity = this.akitaPreAddEntity.bind(this);
    this.akitaPreUpdateEntity = this.akitaPreUpdateEntity.bind(this);
  }

  akitaPreAddEntity(orderItem: OrderItem): OrderItem {
    const product = this.productsQuery.getEntity(orderItem.productCode);

    if (!product) {
      throw Error('Product not found');
    }

    if (orderItem.quantity < findMinQuantity(product)) {
      throw Error('Quantity does not satisfy minimum requirement');
    }

    const divisions = this.determineDivision(product, orderItem.quantity);
    orderItem.divisions = divisions;
    orderItem.lineTotal = orderItem.divisions.map((x) => x.total).reduce((previous, current) => previous + current, 0);

    return orderItem;
  }

  akitaPreUpdateEntity(oldEntity: OrderItem, newEntity: OrderItem): OrderItem {
    const product = this.productsQuery.getEntity(newEntity.productCode);

    const divisions = this.determineDivision(product, newEntity.quantity);
    newEntity.divisions = divisions;
    newEntity.lineTotal = newEntity.divisions.map((x) => x.total).reduce((previous, current) => previous + current, 0);

    return newEntity;
  }

  determineDivision(product: Product, quantity: number): OrderItemDivision[] {
    const sortedPacks = [...product.packs].sort((a, b) => b.unitQuantity - a.unitQuantity);
    const result: OrderItemDivision[] = [];

    let initialRemainder = quantity;

    for (const pack of sortedPacks) {
      let remainder = initialRemainder;

      if (pack.unitQuantity === 0) {
        throw Error('Pack Unit Quantity has a bizarre value of 0');
      }

      if (pack.unitQuantity > remainder) {
        continue;
      }

      remainder %= pack.unitQuantity;

      if (remainder > 0 && sortedPacks.filter((x) => x.unitQuantity < pack.unitQuantity).every((x) => remainder % x.unitQuantity > 0)) {
        continue;
      }

      const noOfPacks = Math.trunc(initialRemainder / pack.unitQuantity);

      result.push({
        description: `${noOfPacks} x ${pack.unitQuantity} $${pack.unitPrice}`,
        total: Math.round(noOfPacks * pack.unitPrice * 100) / 100,
      });

      initialRemainder = remainder;

      if (remainder === 0) {
        break;
      }
    }

    if (initialRemainder > 0) {
      throw Error(`Quantity defies all logic. There's remainder of ${initialRemainder}`);
    }

    return result;
  }
}
