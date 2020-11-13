import { ID } from '@datorama/akita';
import { v4 as uuidv4 } from 'uuid';
import { OrderItemDivision } from './order-item-division.model';

export interface OrderItem {
  id: ID;
  productCode: ID;
  quantity: number;
  lineTotal: number;
  divisions: OrderItemDivision[];
}

export function createOrderItem(params: Partial<OrderItem>): OrderItem {
  return { ...params, id: uuidv4(), divisions: [] } as OrderItem;
}
