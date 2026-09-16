import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {    // check the login
    return router.createUrlTree(['/login']);
  }

  if (authService.getRole() !== 'admin') {    // chek if the user is  not admin
    return router.createUrlTree(['/']);
  }

  return true;
};