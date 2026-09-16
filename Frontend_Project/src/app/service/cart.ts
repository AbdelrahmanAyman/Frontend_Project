import { Injectable, computed, signal } from '@angular/core';

export interface CartLine {
  key: string;
  menuItemId: string;
  name: string;
  size: string;
  toppings: string[];
  price: number;
  qty: number;
}

export interface AddToCartInput {
  menuItemId: string;
  name: string;
  size: string;
  toppings: string[];
  price: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private lines = signal<CartLine[]>([]);
  items = this.lines.asReadonly();

  total = computed(() => this.lines().reduce((sum, l) => sum + l.price * l.qty, 0));
  count = computed(() => this.lines().reduce((sum, l) => sum + l.qty, 0));

  add(input: AddToCartInput) {
    const key = `${input.menuItemId}|${input.size}|${[...input.toppings].sort().join(',')}`;

    this.lines.update((lines) => {
      const existing = lines.find((l) => l.key === key);
      if (existing) {
        return lines.map((l) => (l.key === key ? { ...l, qty: l.qty + input.qty } : l));
      }
      return [...lines, { key, ...input }];
    });
  }

  updateQty(key: string, qty: number) {
    if (qty <= 0) {
      this.remove(key);
      return;
    }
    this.lines.update((lines) => lines.map((l) => (l.key === key ? { ...l, qty } : l)));
  }

  remove(key: string) {
    this.lines.update((lines) => lines.filter((l) => l.key !== key));
  }

  clear() {
    this.lines.set([]);
  }
}