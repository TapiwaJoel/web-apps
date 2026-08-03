import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BarChartComponent } from '../dashboard/components/bar-chart.component';
import { DashboardTopbarComponent } from '../dashboard/components/dashboard-topbar.component';
import { KpiHeroComponent } from '../dashboard/components/kpi-hero.component';
import { LeaderboardTableComponent } from '../dashboard/components/leaderboard-table.component';
import { RankedListComponent } from '../dashboard/components/ranked-list.component';
import { StatTileComponent } from '../dashboard/components/stat-tile.component';
import { DASHBOARD_DATA, DashboardData } from '../dashboard/dashboard.types';

@Component({
  selector: 'org-dashboard-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DashboardTopbarComponent,
    KpiHeroComponent,
    StatTileComponent,
    BarChartComponent,
    RankedListComponent,
    LeaderboardTableComponent,
  ],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent {
  protected readonly data: DashboardData = DASHBOARD_DATA;
}
