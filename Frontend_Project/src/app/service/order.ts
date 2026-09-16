import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStats } from '../models';

export interface MyOrdersResponse {
  status: string;
  data: {
    stats: OrderStats;
    activeOrders: Order[];
    orderHistory: Order[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/v1/orders';

  getMyOrders(): Observable<MyOrdersResponse> {
    return this.http.get<MyOrdersResponse>(`${this.baseUrl}/me`);
  }

  cancelOrder(id: string): Observable<{ status: string; message: string }> {
    return this.http.patch<{ status: string; message: string }>(`${this.baseUrl}/${id}/cancel`, {});
  }

  createOrder(payload: { items: { name: string; size: string; toppings: string[]; qty: number; price: number }[]; address: string; payment: string }) {
    return this.http.post<{ status: string; data: { order: Order } }>(this.baseUrl, payload);
  }

  markDelivered(id: string): Observable<{ status: string; message: string }> {
    return this.http.patch<{ status: string; message: string }>(`${this.baseUrl}/${id}/deliver`, {});
  }

  getAllOrders(): Observable<{ status: string; count: number; data: { orders: Order[] } }> {
    return this.http.get<{ status: string; count: number; data: { orders: Order[] } }>(this.baseUrl);
  }
}