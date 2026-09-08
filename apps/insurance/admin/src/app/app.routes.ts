import { Route } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { DashboardHomeComponent } from './pages/dashboard/dashboard-home.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { BillingComponent } from './pages/billing/billing.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { ClientDirectoryComponent } from './pages/client-directory/client-directory.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { AllPoliciesComponent } from './pages/policies/all-policies/all-policies.component';
import { ActivePoliciesComponent } from './pages/policies/active-policies/active-policies.component';
import { LapsedPoliciesComponent } from './pages/policies/lapsed-policies/lapsed-policies.component';
import { ClaimsComponent } from './pages/claims/claims.component';
import { OpenClaimsComponent } from './pages/claims/open-claims/open-claims.component';
import { UnderReviewClaimsComponent } from './pages/claims/under-review-claims/under-review-claims.component';
import { SettledClaimsComponent } from './pages/claims/settled-claims/settled-claims.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { QuotesComponent } from './pages/quotes/quotes.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { UsersComponent } from './pages/users/users.component';

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
        path: 'policies',
        children: [
          {
            path: '',
            component: PoliciesComponent,
          },
          {
            path: 'all',
            component: AllPoliciesComponent,
          },
          {
            path: 'active',
            component: ActivePoliciesComponent,
          },
          {
            path: 'lapsed',
            component: LapsedPoliciesComponent,
          },
        ],
      },
      {
        path: 'claims',
        children: [
          {
            path: '',
            component: ClaimsComponent,
          },
          {
            path: 'open',
            component: OpenClaimsComponent,
          },
          {
            path: 'under-review',
            component: UnderReviewClaimsComponent,
          },
          {
            path: 'settled',
            component: SettledClaimsComponent,
          },
        ],
      },
      {
        path: 'vehicles',
        component: VehiclesComponent,
      },
      {
        path: 'client-directory',
        component: ClientDirectoryComponent,
      },
      {
        path: 'billing',
        component: BillingComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
      },
      {
        path: 'agents',
        component: AgentsComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'quotes',
        component: QuotesComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'preferences',
        component: PreferencesComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
