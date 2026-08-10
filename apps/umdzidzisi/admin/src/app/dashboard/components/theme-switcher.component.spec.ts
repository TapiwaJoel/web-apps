import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '@mushaviri/util-theming';
import { ThemeSwitcherComponent } from './theme-switcher.component';

describe('ThemeSwitcherComponent', () => {
  let fixture: ComponentFixture<ThemeSwitcherComponent>;
  let theme: ThemeService;

  beforeEach(async () => {
    localStorage.removeItem('umdzidzisi-theme-mode');
    await TestBed.configureTestingModule({
      providers: [ThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    theme = TestBed.inject(ThemeService);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('applies and persists the dark theme when Dark is chosen', () => {
    (fixture.nativeElement.querySelector('.theme-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    const dark: HTMLElement | undefined = Array.from(
      document.querySelectorAll('.theme-option'),
    ).find((el: Element) => el.textContent?.includes('Dark')) as HTMLElement;
    (dark as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(theme.getCurrentTheme()).toBe('umdzidzisi-dark');
    expect(localStorage.getItem('umdzidzisi-theme-mode')).toBe('dark');
  });

  it('applies the light theme when Light is chosen', () => {
    (fixture.nativeElement.querySelector('.theme-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    const light: HTMLElement | undefined = Array.from(
      document.querySelectorAll('.theme-option'),
    ).find((el: Element) => el.textContent?.trim().startsWith('Light')) as HTMLElement;
    (light as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(theme.getCurrentTheme()).toBe('umdzidzisi');
    expect(localStorage.getItem('umdzidzisi-theme-mode')).toBe('light');
  });
});
