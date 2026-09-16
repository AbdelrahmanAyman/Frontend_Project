import { Routes } from '@angular/router';
import { authGuard } from './guard/auth-guard';
import { guestGuard } from './guard/guest-guard';
import { adminGuard } from './guard/admin-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then((m) => m.Login)
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./signup/signup').then((m) => m.Signup)
  },
  {
    path: 'menu',
    loadComponent: () => import('./menu-list/menu-list').then((m) => m.MenuList)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./checkout/checkout').then((m) => m.Checkout)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'orders/manage',
    canActivate: [adminGuard],
    loadComponent: () => import('./order-manage/order-manage').then((m) => m.OrderManage)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile').then((m) => m.ProfilePanel)
  },
  {
    path: '**',
    redirectTo: ''
  }
];