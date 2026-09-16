import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../service/cart';
import { OrderService } from '../service/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  address = '';
  payment = 'Cash on delivery';
  placing = signal(false);
  errorMessage = signal('');

  removeLine(key: string) { this.cartService.remove(key); }
  updateQty(key: string, qty: number) { this.cartService.updateQty(key, qty); }

  placeOrder() {    // validates the payment method and address and submits the order
    if (this.cartService.items().length === 0) return;
    if (!this.address.trim()) {
      this.errorMessage.set('Please add a delivery address.');
      return;
    }

    const payload = {
      items: this.cartService.items().map((l) => ({ name: l.name, size: l.size, toppings: l.toppings, qty: l.qty, price: l.price })),
      address: this.address,
      payment: this.payment
    };

    this.placing.set(true);
    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.cartService.clear();
        this.placing.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.placing.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to place order');
      }
    });
  }
}