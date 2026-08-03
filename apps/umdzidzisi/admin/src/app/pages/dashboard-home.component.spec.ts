import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHomeComponent } from './dashboard-home.component';

describe('DashboardHomeComponent', () => {
  it('composes the hero, stat tiles, chart, ranked list, leaderboard and topbar', async () => {
    const fixture: ComponentFixture<DashboardHomeComponent> =
      TestBed.createComponent(DashboardHomeComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('org-dashboard-topbar')).toBeTruthy();
    expect(el.querySelector('org-kpi-hero')).toBeTruthy();
    expect(el.querySelectorAll('org-stat-tile').length).toBe(3);
    expect(el.querySelector('org-bar-chart')).toBeTruthy();
    expect(el.querySelector('org-ranked-list')).toBeTruthy();
    expect(el.querySelector('org-leaderboard-table')).toBeTruthy();
  });
});
