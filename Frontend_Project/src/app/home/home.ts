import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../service/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  authService = inject(AuthService);

  get firstName(): string {     // split the first name for the welcome message
    return this.authService.currentUser()?.name?.split(' ')[0] ?? 'there';
  }
}
