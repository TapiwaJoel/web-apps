import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardTopbarComponent } from './dashboard-topbar.component';

describe('DashboardTopbarComponent', () => {
  it('renders a search input and the user name', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture: ComponentFixture<DashboardTopbarComponent> =
      TestBed.createComponent(DashboardTopbarComponent);
    fixture.componentRef.setInput('userName', 'Tapiwa');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('input[type="search"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent as string).toContain('Tapiwa');
  });
});
