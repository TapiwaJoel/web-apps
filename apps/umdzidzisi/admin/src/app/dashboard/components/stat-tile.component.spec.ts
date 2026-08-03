import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatTileComponent } from './stat-tile.component';
import { StatMetric } from '../dashboard.types';

const metric: StatMetric = {
  label: 'Pass rate',
  value: 74,
  suffix: '%',
  delta: { pct: 2.1 },
  series: [69, 70, 71, 74],
};

describe('StatTileComponent', () => {
  it('renders the label, value with suffix, and a sparkline', async () => {
    const fixture: ComponentFixture<StatTileComponent> =
      TestBed.createComponent(StatTileComponent);
    fixture.componentRef.setInput('metric', metric);
    await fixture.whenStable();
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent as string;
    expect(text).toContain('Pass rate');
    expect(text).toContain('74');
    expect(text).toContain('%');
    expect(fixture.nativeElement.querySelector('org-sparkline')).toBeTruthy();
  });

  it('renders a dark featured card when featured is true', async () => {
    const fixture: ComponentFixture<StatTileComponent> =
      TestBed.createComponent(StatTileComponent);
    fixture.componentRef.setInput('metric', metric);
    fixture.componentRef.setInput('featured', true);
    await fixture.whenStable();
    fixture.detectChanges();
    const card: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(card.classList.contains('bg-umdzidzisi-800')).toBe(true);
    expect(card.classList.contains('bg-white')).toBe(false);
  });
});
