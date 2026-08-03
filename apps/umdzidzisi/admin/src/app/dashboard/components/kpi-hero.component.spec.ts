import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiHeroComponent } from './kpi-hero.component';
import { KpiSummary } from '../dashboard.types';

const kpi: KpiSummary = {
  label: 'Active learners',
  value: 12480,
  delta: { pct: 8.2, abs: 947 },
  previous: 11533,
  period: 'This term',
};

describe('KpiHeroComponent', () => {
  it('renders the label, formatted value, delta pill and comparison line', async () => {
    const fixture: ComponentFixture<KpiHeroComponent> =
      TestBed.createComponent(KpiHeroComponent);
    fixture.componentRef.setInput('kpi', kpi);
    await fixture.whenStable();
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent as string;
    expect(text).toContain('Active learners');
    expect(text).toContain('12,480');
    expect(text).toContain('8.2');
    expect(text).toContain('11,533');
    expect(text).toContain('This term');
  });
});
