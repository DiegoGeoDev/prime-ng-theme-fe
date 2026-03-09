import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/designer',
    pathMatch: 'full',
  },
  {
    path: 'designer',
    loadChildren: () => import('./features/designer/designer.routes').then((m) => m.designerRoutes),
  },
];
