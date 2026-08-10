import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';

describe('ChangePasswordDialogComponent', () => {
  let fixture: ComponentFixture<ChangePasswordDialogComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ChangePasswordDialogComponent);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('keeps the submit button disabled until the form is valid and matching', () => {
    const submit = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector('.cpw-btn-primary');
    expect(submit().disabled).toBe(true);

    const form = fixture.componentInstance['form'];
    form.setValue({
      currentPassword: 'oldpass1',
      newPassword: 'newpass12',
      confirmPassword: 'different',
    });
    fixture.detectChanges();
    expect(submit().disabled).toBe(true); // mismatch

    form.get('confirmPassword')?.setValue('newpass12');
    fixture.detectChanges();
    expect(submit().disabled).toBe(false); // valid + matching
  });

  it('emits close after a valid submit', (done) => {
    fixture.componentInstance.close.subscribe(() => done());
    const form = fixture.componentInstance['form'];
    form.setValue({
      currentPassword: 'oldpass1',
      newPassword: 'newpass12',
      confirmPassword: 'newpass12',
    });
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.cpw-btn-primary') as HTMLButtonElement).click();
  });
});
