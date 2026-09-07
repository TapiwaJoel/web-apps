import {
  ChangeDetectionStrategy,
  Component,
  signal,
  WritableSignal,
} from '@angular/core';

/**
 * Header global search: a single input with a leading search icon. Simplified
 * for v1 — no scope-selector dropdown, no ⌘K overlay (not in the design).
 */
@Component({
  selector: 'org-global-search',
  standalone: true,
  templateUrl: './global-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent {
  protected readonly query: WritableSignal<string> = signal('');

  protected onInput(event: Event): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    this.query.set(target.value);
  }
}
