import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';

describe('DashboardLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the topbar in the shared layout so it appears on every page', async () => {
    const fixture: ComponentFixture<DashboardLayoutComponent> =
      TestBed.createComponent(DashboardLayoutComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('org-dashboard-topbar')).toBeTruthy();
  });
});
