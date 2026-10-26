import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InputSignal,
  input,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateRoleDto } from '@mushaviri/api';
import { ADMIN_SERVICE_NAME } from '@mushaviri/util';
import { CreateRoleForm } from '../../types/create-role-form.type';
import { EMPTY_CREATE_ROLE_FORM } from '../../types/empty-create-role-form.const';

@Component({
  selector: 'org-create-role-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-role-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoleDialogComponent {
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);

  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateRoleDto> =
    output<CreateRoleDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateRoleForm> = signal({
    ...EMPTY_CREATE_ROLE_FORM,
  });

  protected readonly isValid: Signal<boolean> = computed(() =>
    Boolean(this.form().name.trim()),
  );

  protected updateForm<K extends keyof CreateRoleForm>(
    field: K,
    value: CreateRoleForm[K],
  ): void {
    this.form.update((current: CreateRoleForm) => ({
      ...current,
      [field]: value,
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { name, description, isSensitive }: CreateRoleForm = this.form();
    this.create.emit({
      name: name.trim(),
      description: description.trim() || undefined,
      serviceName: this.serviceName,
      isSensitive,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
