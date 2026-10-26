import { Route } from '@angular/router';
import { INSURANCE_PATH } from '@mushaviri/api';
import { ADMIN_SERVICE_NAME } from '@mushaviri/util';
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
import { QuotesComponent } from './pages/quotes/quotes.component';
import {
  ProfileComponent,
  PreferencesComponent,
  UsersComponent,
  RolesComponent,
} from '@mushaviri/ui';
import { VehicleUsagesComponent } from './pages/vehicle-usages/vehicle-usages.component';
import { VehicleTypesComponent } from './pages/vehicle-types/vehicle-types.component';
import { PolicyPeriodsComponent } from './pages/policy-periods/policy-periods.component';
import { InsuranceCompaniesComponent } from './pages/insurance-companies/insurance-companies.component';
import { InsuranceCoverageTypesComponent } from './pages/insurance-coverage-types/insurance-coverage-types.component';
import { ComprehensiveRatesComponent } from './pages/comprehensive-rates/comprehensive-rates.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: DashboardLayoutComponent,
    providers: [{ provide: ADMIN_SERVICE_NAME, useValue: INSURANCE_PATH }],
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
        path: 'quotes',
        component: QuotesComponent,
      },
      {
        path: 'vehicle-usages',
        children: [
          {
            path: '',
            component: VehicleUsagesComponent,
          },
          {
            path: ':id',
            component: VehicleUsagesComponent,
          },
        ],
      },
      {
        path: 'vehicle-types',
        children: [
          {
            path: '',
            component: VehicleTypesComponent,
          },
          {
            path: ':id',
            component: VehicleTypesComponent,
          },
        ],
      },
      {
        path: 'policy-periods',
        children: [
          {
            path: '',
            component: PolicyPeriodsComponent,
          },
          {
            path: ':id',
            component: PolicyPeriodsComponent,
          },
        ],
      },
      {
        path: 'insurance-companies',
        children: [
          {
            path: '',
            component: InsuranceCompaniesComponent,
          },
          {
            path: ':id',
            component: InsuranceCompaniesComponent,
          },
        ],
      },
      {
        path: 'insurance-coverage-types',
        children: [
          {
            path: '',
            component: InsuranceCoverageTypesComponent,
          },
          {
            path: ':id',
            component: InsuranceCoverageTypesComponent,
          },
        ],
      },
      {
        path: 'comprehensive-rates',
        children: [
          {
            path: '',
            component: ComprehensiveRatesComponent,
          },
          {
            path: ':id',
            component: ComprehensiveRatesComponent,
          },
        ],
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            component: UsersComponent,
          },
          {
            path: ':id',
            component: UsersComponent,
          },
        ],
      },
      {
        path: 'roles',
        children: [
          {
            path: '',
            component: RolesComponent,
          },
          {
            path: ':id',
            component: RolesComponent,
          },
        ],
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
