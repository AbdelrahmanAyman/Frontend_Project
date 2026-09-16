import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { User, AuthResponse } from '../models';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/v1/auth';

  currentUser = signal<User | null>(this.getUserFromStorage());

  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => this.handleAuth(res))
    );
  }

  signup(formData: FormData) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, formData).pipe(
      tap((res) => this.handleAuth(res))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getPhotoUrl(photoPath?: string): string {
    if (!photoPath) return 'src/assets/default.jpg';
    if (photoPath === 'default.jpg') return 'assets/default.jpg';
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:5000/uploads/users/${photoPath}`;
  }

  private handleAuth(res: AuthResponse) {
    if (res.token) localStorage.setItem('token', res.token);
    const user = res.user || res.data?.user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  private getUserFromStorage(): User | null {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  }
}