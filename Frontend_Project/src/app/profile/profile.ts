import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth';
import { UserService } from '../service/user';

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePanel {
  authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  isEditing = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  name = '';
  phone = '';
  selectedFile: File | null = null;
  photoPreview = signal<string | null>(null);

  startEdit() {
    const user = this.authService.currentUser();
    this.name = user?.name ?? '';
    this.phone = user?.phone ?? '';
    this.selectedFile = null;
    this.photoPreview.set(null);
    this.errorMessage.set('');
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.photoPreview.set(URL.createObjectURL(this.selectedFile));
    }
  }

  saveProfile() {
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('phone', this.phone);
    if (this.selectedFile) formData.append('photo', this.selectedFile);

    this.saving.set(true);
    this.userService.updateProfile(formData).subscribe({
      next: (user) => {
        this.authService.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        this.saving.set(false);
        this.isEditing.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update profile');
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}