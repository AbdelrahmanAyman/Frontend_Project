import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../service/order';
import { Order, OrderStats } from '../models';
import { AuthService } from '../service/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private orderService = inject(OrderService);
  authService = inject(AuthService);

  stats = signal<OrderStats>({ totalOrders: 0, totalSpent: 0, activeOrders: 0 });
  activeOrders = signal<Order[]>([]);
  orderHistory = signal<Order[]>([]);
  activeTab = signal<'active' | 'history'>('active');

  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit() {    // loadinig the order when the page opened
    this.loadOrders();
  }

  private loadOrders() {    // calculates the total money spent,total orders and active orders 
    this.isLoading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.stats.set(res.data.stats);
        this.activeOrders.set(res.data.activeOrders);
        this.orderHistory.set(res.data.orderHistory);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load your orders');
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: 'active' | 'history') {   // switches between the active and history tabs
    this.activeTab.set(tab);
  }

  cancelOrder(id: string) {   // cancel the order
    this.orderService.cancelOrder(id).subscribe({
      next: () => this.loadOrders(),
      error: () => this.errorMessage.set('Failed to cancel order')
    });
  }

  markDelivered(id: string) {   // marks the delivered orders (by admins only)
    this.orderService.markDelivered(id).subscribe({
      next: () => this.loadOrders(),
      error: () => this.errorMessage.set('Failed to update order')
    });
  }

 
}