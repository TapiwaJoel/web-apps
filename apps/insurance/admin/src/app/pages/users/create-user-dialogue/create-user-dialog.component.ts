import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateSystemUserDto, RoleResponseDto } from '@mushaviri/api';
import {
  CreateUserForm,
  EMPTY_FORM,
} from '../../../shared/types/users/create-user-dialog.types';
import { normalizeZimbabweanPhoneNumber } from '../../../shared/utils/phone-number.util';

const DEFAULT_COUNTRY: string = 'Zimbabwe';

@Component({
  selector: 'org-create-user-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-user-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserDialogComponent {
  public readonly roles: InputSignal<RoleResponseDto[]> = input<
    RoleResponseDto[]
  >([]);
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateSystemUserDto> =
    output<CreateSystemUserDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateUserForm> = signal({
    ...EMPTY_FORM,
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { name, phoneNumber, emailAddress, role }: CreateUserForm =
      this.form();
    return Boolean(
      name &&
      emailAddress &&
      role &&
      normalizeZimbabweanPhoneNumber(phoneNumber) !== null,
    );
  });

  protected updateForm<K extends keyof CreateUserForm>(
    field: K,
    value: CreateUserForm[K],
  ): void {
    this.form.update((current: CreateUserForm) => ({
      ...current,
      [field]: value,
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { name, phoneNumber, emailAddress, role }: CreateUserForm =
      this.form();
    const normalizedPhoneNumber: string | null =
      normalizeZimbabweanPhoneNumber(phoneNumber);
    if (!normalizedPhoneNumber) {
      return;
    }
    this.create.emit({
      name,
      phoneNumber: normalizedPhoneNumber,
      emailAddress,
      country: DEFAULT_COUNTRY,
      role,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
