import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsMenuComponent } from './notifications-menu.component';

describe('NotificationsMenuComponent', () => {
  let fixture: ComponentFixture<NotificationsMenuComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(NotificationsMenuComponent);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('shows an unread count pill matching the unread notifications', () => {
    const pill: HTMLElement | null =
      fixture.nativeElement.querySelector('.notif-count');
    expect(pill).toBeTruthy();
    // Three of the five dummy notifications start unread.
    expect(pill?.textContent?.trim()).toBe('3');
  });

  it('opens the panel and marks all read, revealing the empty state', () => {
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('.notif-trigger');
    trigger.click();
    fixture.detectChanges();

    const markAll: HTMLButtonElement =
      document.querySelector('.notif-action') as HTMLButtonElement;
    expect(markAll).toBeTruthy();
    markAll.click();
    fixture.detectChanges();

    expect(document.querySelector('.notif-empty')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.notif-count')).toBeNull();
  });
});
