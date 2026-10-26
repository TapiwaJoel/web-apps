import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateSystemUserDto,
  RoleResponseDto,
  SystemUserResponseDto,
} from '@mushaviri/api';
import { CreateUserForm } from '../../types/create-user-form.type';
import { EMPTY_CREATE_USER_FORM } from '../../types/empty-create-user-form.const';
import { normalizeZimbabweanPhoneNumber } from '@mushaviri/util';

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
  public readonly user: InputSignal<SystemUserResponseDto | null> =
    input<SystemUserResponseDto | null>(null);

  public readonly submitted: OutputEmitterRef<CreateSystemUserDto> =
    output<CreateSystemUserDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly isEditing: Signal<boolean> = computed(
    () => this.user() !== null,
  );

  protected readonly form: WritableSignal<CreateUserForm> = signal({
    ...EMPTY_CREATE_USER_FORM,
  });

  public constructor() {
    effect((): void => {
      const editedUser: SystemUserResponseDto | null = this.user();
      this.form.set(
        editedUser
          ? {
              name: editedUser.name,
              phoneNumber: editedUser.phoneNumber,
              emailAddress: editedUser.emailAddress ?? '',
              role: editedUser.role,
            }
          : { ...EMPTY_CREATE_USER_FORM },
      );
    });
  }

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
    this.submitted.emit({
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
