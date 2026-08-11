import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfileMenuComponent } from './profile-menu.component';

describe('ProfileMenuComponent', () => {
  let fixture: ComponentFixture<ProfileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMenuComponent);
    fixture.componentRef.setInput('userName', 'Umdzidzisi Admin');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders the initials on the trigger', () => {
    const avatar: HTMLElement =
      fixture.nativeElement.querySelector('.profile-avatar');
    expect(avatar.textContent?.trim()).toBe('UA');
  });

  it('emits changePassword when the item is chosen', () => {
    let changed: boolean = false;
    fixture.componentInstance.changePassword.subscribe(() => (changed = true));

    (fixture.nativeElement.querySelector('.profile-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    const items: NodeListOf<HTMLElement> =
      document.querySelectorAll('.profile-item');
    const changeItem: HTMLElement | undefined = Array.from(items).find(
      (el: HTMLElement) => el.textContent?.includes('Change password'),
    );
    (changeItem as HTMLButtonElement).click();

    expect(changed).toBe(true);
  });
});
