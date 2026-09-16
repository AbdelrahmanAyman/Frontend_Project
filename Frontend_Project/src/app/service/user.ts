import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models';

interface UserResponse {
  status: string;
  data: { user: User };
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/v1/users';

  getProfile(): Observable<User> {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`).pipe(map((res) => res.data.user));
  }

  updateProfile(formData: FormData): Observable<User> {
    return this.http.patch<UserResponse>(`${this.baseUrl}/me`, formData).pipe(map((res) => res.data.user));
  }
}