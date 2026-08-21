import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full',
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./components/customer-list/customer-list.component').then(
        (m) => m.CustomerListComponent
      ),
  },
  {
    path: 'customers/create',
    loadComponent: () =>
      import('./components/customer-form/customer-form.component').then(
        (m) => m.CustomerFormComponent
      ),
  },
  {
    path: 'customers/:id',
    loadComponent: () =>
      import('./components/customer-view/customer-view.component').then(
        (m) => m.CustomerViewComponent
      ),
  },
  {
    path: 'customers/:id/edit',
    loadComponent: () =>
      import('./components/customer-form/customer-form.component').then(
        (m) => m.CustomerFormComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'customers',
  },
];
