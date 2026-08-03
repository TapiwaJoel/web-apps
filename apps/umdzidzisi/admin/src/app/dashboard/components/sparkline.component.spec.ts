import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SparklineComponent } from './sparkline.component';

describe('SparklineComponent', () => {
  it('renders an svg path for a multi-point series', async () => {
    const fixture: ComponentFixture<SparklineComponent> =
      TestBed.createComponent(SparklineComponent);
    fixture.componentRef.setInput('series', [1, 5, 3, 8]);
    await fixture.whenStable();
    fixture.detectChanges();
    const path: HTMLElement | null =
      fixture.nativeElement.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')?.startsWith('M ')).toBe(true);
  });
});
