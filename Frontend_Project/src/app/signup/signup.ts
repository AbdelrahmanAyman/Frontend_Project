import { Component, inject, signal } from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  phone = '';
  password = '';
  selectedFile: File | null = null;
  photoPreview = signal<string | null>(null);
  errorMessage = '';

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.photoPreview.set(URL.createObjectURL(this.selectedFile))
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('email', this.email);
    formData.append('phone', this.phone);
    formData.append('password', this.password);
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.authService.signup(formData).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.errorMessage = err.error?.message || 'Signup failed'
    });
  }
}