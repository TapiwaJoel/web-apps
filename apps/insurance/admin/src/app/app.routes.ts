import { Route } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { DashboardHomeComponent } from './pages/dashboard/dashboard-home.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { BillingComponent } from './pages/billing/billing.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { ClientDirectoryComponent } from './pages/client-directory/client-directory.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardHomeComponent,
      },
      {
        path: 'documents',
        component: DocumentsComponent,
      },
      {
        path: 'vehicles',
        component: VehiclesComponent,
      },
      {
        path: 'billing',
        component: BillingComponent,
      },
      {
        path: 'agents',
        component: AgentsComponent,
      },
      {
        path: 'client-directory',
        component: ClientDirectoryComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
