import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MenuItem } from '../models';

interface MenuListResponse {
  status: string;
  count: number;
  data: { menuItems: MenuItem[] };
}

interface MenuItemResponse {
  status: string;
  message?: string;
  data: { menuItem: MenuItem };
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/v1/menu';

  getMenuItems(): Observable<MenuItem[]> {
    return this.http
      .get<MenuListResponse>(this.baseUrl)
      .pipe(map((res) => res.data.menuItems));
  }

  getItemById(id: string): Observable<MenuItem> {
    return this.http
      .get<MenuItemResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data.menuItem));
  }

  createMenuItem(formData: FormData): Observable<MenuItem> {
    return this.http
      .post<MenuItemResponse>(this.baseUrl, formData)
      .pipe(map((res) => res.data.menuItem));
  }

  updateMenuItem(id: string, formData: FormData): Observable<MenuItem> {
    return this.http
      .patch<MenuItemResponse>(`${this.baseUrl}/${id}`, formData)
      .pipe(map((res) => res.data.menuItem));
  }

  deleteMenuItem(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(`${this.baseUrl}/${id}`);
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) return 'assets/default.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/menu/${imagePath}`;
  }
}