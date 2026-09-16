import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../service/order';
import { Order } from '../models';

interface CustomerGroup {
  customerName: string;
  customerEmail: string;
  orders: Order[];
}

@Component({
  selector: 'app-order-manage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-manage.html',
  styleUrl: './order-manage.css'
})
export class OrderManage implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  activeTab = signal<'active' | 'delivered' | 'cancelled'>('active');
  updatingId = signal<string | null>(null);

  filteredOrders = computed(() => {
    const tab = this.activeTab();
    return this.orders().filter((o) => {
      if (tab === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
      return o.status === tab;
    });
  });

  groupedByCustomer = computed<CustomerGroup[]>(() => {
    const groups = new Map<string, CustomerGroup>();

    for (const order of this.filteredOrders()) {
      const key = order.user?._id ?? 'unknown';
      const name = order.user?.name ?? 'Unknown customer';
      const email = order.user?.email ?? '';

      if (!groups.has(key)) {
        groups.set(key, { customerName: name, customerEmail: email, orders: [] });
      }
      groups.get(key)!.orders.push(order);
    }

    return Array.from(groups.values());
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data.orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load orders');
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: 'active' | 'delivered' | 'cancelled') {
    this.activeTab.set(tab);
  }

  markDelivered(order: Order) {
    this.updatingId.set(order._id);
    this.orderService.markDelivered(order._id).subscribe({
      next: () => {
        this.orders.update((list) =>
          list.map((o) => (o._id === order._id ? { ...o, status: 'delivered' } : o))
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Failed to update order');
        this.updatingId.set(null);
      }
    });
  }

  orderSummary(order: Order): string {
    return order.items.map((i) => `${i.qty}× ${i.name}`).join(', ');
  }

  formatStatus(status: string): string {
    return status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}