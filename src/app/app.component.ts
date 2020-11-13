import { Component } from '@angular/core';
import { OrderItem, OrderItemsService } from './state/order-items';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'FancyBakery';

  constructor(private orderItemsService: OrderItemsService) {}

  orderItemAdded(event: OrderItem): void {
    this.orderItemsService.upsert(event);
  }
}
