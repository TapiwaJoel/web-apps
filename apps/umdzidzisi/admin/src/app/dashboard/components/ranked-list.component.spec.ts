import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RankedListComponent } from './ranked-list.component';
import { SubjectRank } from '../dashboard.types';

const items: SubjectRank[] = [
  { label: 'Mathematics', value: 1842, pct: 38 },
  { label: 'English', value: 1357, pct: 27 },
];

describe('RankedListComponent', () => {
  it('renders a row per item with label, value and a percent bar', async () => {
    const fixture: ComponentFixture<RankedListComponent> =
      TestBed.createComponent(RankedListComponent);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent as string;
    expect(text).toContain('Mathematics');
    expect(text).toContain('1,842');
    expect(text).toContain('38%');
    // one progress bar element per item
    expect(fixture.nativeElement.querySelectorAll('[data-bar]').length).toBe(2);
  });
});
