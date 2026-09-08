import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  DashboardPageData,
  MOCK_DASHBOARD_DATA,
} from '../../shared/types/dashboard/dashboard.types';
import { KpiStatCardComponent } from './components/kpi-stat-card.component';
import { PremiumGrowthChartComponent } from './components/premium-growth-chart.component';
import { RecentActivityListComponent } from './components/recent-activity-list.component';
import { QuickActionsComponent } from './components/quick-actions.component';
import { PromoBannerComponent } from './components/promo-banner.component';
import { RecentApplicationsTableComponent } from './components/recent-applications-table.component';

@Component({
  selector: 'org-dashboard-home',
  standalone: true,
  imports: [
    KpiStatCardComponent,
    PremiumGrowthChartComponent,
    RecentActivityListComponent,
    QuickActionsComponent,
    PromoBannerComponent,
    RecentApplicationsTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent {
  protected readonly data: DashboardPageData = MOCK_DASHBOARD_DATA;
}
