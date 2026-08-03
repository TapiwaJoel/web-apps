import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardTableComponent } from './leaderboard-table.component';
import { BoardRow } from '../dashboard.types';

const rows: BoardRow[] = [
  {
    board: 'Cambridge IGCSE',
    level: 'O-Level',
    candidates: 4210,
    passRate: 76,
    delta: { pct: 3.4 },
  },
  {
    board: 'Edexcel',
    level: 'O-Level',
    candidates: 2140,
    passRate: 69,
    delta: { pct: -1.2 },
  },
];

describe('LeaderboardTableComponent', () => {
  it('renders a table row per board with candidates and pass rate', async () => {
    const fixture: ComponentFixture<LeaderboardTableComponent> =
      TestBed.createComponent(LeaderboardTableComponent);
    fixture.componentRef.setInput('rows', rows);
    await fixture.whenStable();
    fixture.detectChanges();
    const bodyRows: NodeListOf<HTMLTableRowElement> =
      fixture.nativeElement.querySelectorAll('tbody tr');
    expect(bodyRows.length).toBe(2);
    const text: string = fixture.nativeElement.textContent as string;
    expect(text).toContain('Cambridge IGCSE');
    expect(text).toContain('4,210');
    expect(text).toContain('76%');
  });
});
