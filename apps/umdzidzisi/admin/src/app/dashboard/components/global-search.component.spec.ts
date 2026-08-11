import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import type { MockInstance } from 'vitest';
import { GlobalSearchComponent } from './global-search.component';

describe('GlobalSearchComponent', () => {
  let fixture: ComponentFixture<GlobalSearchComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalSearchComponent);
    router = TestBed.inject(Router);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('defaults to the "All" scope with its placeholder', () => {
    const label: HTMLElement =
      fixture.nativeElement.querySelector('.scope-label');
    expect(label.textContent?.trim()).toBe('All');
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('.search-input');
    expect(input.placeholder).toBe('Search everything…');
  });

  it('switches scope and updates the placeholder', () => {
    (fixture.nativeElement.querySelector('.scope-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    const options: NodeListOf<HTMLElement> =
      document.querySelectorAll('.scope-option');
    const subjects: HTMLElement | undefined = Array.from(options).find(
      (el: HTMLElement) => el.textContent?.includes('Subjects'),
    );
    (subjects as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement.querySelector('.scope-label') as HTMLElement)
        .textContent?.trim(),
    ).toBe('Subjects');
    expect(
      (fixture.nativeElement.querySelector('.search-input') as HTMLInputElement)
        .placeholder,
    ).toBe('Search subjects…');
  });

  it('emits and navigates to the scope route with ?q on submit', () => {
    const navSpy: MockInstance<Router['navigate']> = spyOn(
      router,
      'navigate',
    );
    let emitted: { scope: string; query: string } | undefined;
    fixture.componentInstance.searched.subscribe((e) => (emitted = e));

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('.search-input');
    input.value = 'algebra';
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(emitted).toEqual({ scope: 'all', query: 'algebra' });
    expect(navSpy).toHaveBeenCalledWith(['dashboard'], {
      queryParams: { q: 'algebra' },
    });
  });

  it('does not submit an empty query', () => {
    const navSpy: MockInstance<Router['navigate']> = spyOn(
      router,
      'navigate',
    );
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('.search-input');
    input.value = '   ';
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(navSpy).not.toHaveBeenCalled();
  });
});
