import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';
import { TimeSeries } from '../dashboard.types';

const series: TimeSeries[] = [
  { key: 'a', label: 'A', points: [1, 2, 3], categories: ['x', 'y', 'z'] },
  { key: 'b', label: 'B', points: [4, 5], categories: ['p', 'q'] },
];

describe('BarChartComponent', () => {
  it('renders a rect per point of the first series and a tab per series', async () => {
    const fixture: ComponentFixture<BarChartComponent> =
      TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('series', series);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('rect').length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(2);
  });

  it('switches series when a tab is clicked', async () => {
    const fixture: ComponentFixture<BarChartComponent> =
      TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('series', series);
    await fixture.whenStable();
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('rect').length).toBe(2);
  });
});
