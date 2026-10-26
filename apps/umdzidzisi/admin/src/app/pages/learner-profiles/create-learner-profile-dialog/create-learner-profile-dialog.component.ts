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
import {
  CreateProfileDto,
  EducationalLevelResponseDto,
  GradeResponseDto,
  ProfileResponseDto,
  ProfileType,
  SystemUserResponseDto,
} from '@mushaviri/api';
import { CmsImagePickerComponent } from '../../../shared/components/cms-image-picker/cms-image-picker.component';
import { CreateLearnerProfileForm } from '../../../shared/types/learner-profiles/create-learner-profile-form.type';
import { EMPTY_CREATE_LEARNER_PROFILE_FORM } from '../../../shared/types/learner-profiles/empty-create-learner-profile-form.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { PROFILE_TYPE_OPTIONS } from '../../../shared/types/common/profile-type-options.const';

/** How many matching users the picker lists before asking for a narrower search. */
const MAX_USER_OPTIONS: number = 50;

/**
 * Creates a profile of any type for an existing system user. Students need a
 * level and grade, tutors need a bio, and every type needs an image.
 */
@Component({
  selector: 'org-create-learner-profile-dialog',
  standalone: true,
  imports: [FormsModule, CmsImagePickerComponent],
  templateUrl: './create-learner-profile-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLearnerProfileDialogComponent {
  // State
  protected readonly ProfileType: typeof ProfileType = ProfileType;
  protected readonly typeOptions: SelectOption<ProfileType>[] =
    PROFILE_TYPE_OPTIONS;

  protected readonly form: WritableSignal<CreateLearnerProfileForm> = signal({
    ...EMPTY_CREATE_LEARNER_PROFILE_FORM,
  });
  protected readonly userSearch: WritableSignal<string> = signal('');

  // Signal inputs
  public readonly users: InputSignal<SystemUserResponseDto[]> = input<
    SystemUserResponseDto[]
  >([]);
  public readonly existingProfiles: InputSignal<ProfileResponseDto[]> = input<
    ProfileResponseDto[]
  >([]);
  public readonly educationalLevels: InputSignal<
    EducationalLevelResponseDto[]
  > = input<EducationalLevelResponseDto[]>([]);
  public readonly grades: InputSignal<GradeResponseDto[]> = input<
    GradeResponseDto[]
  >([]);
  public readonly creating: InputSignal<boolean> = input(false);

  // Signal outputs
  public readonly create: OutputEmitterRef<CreateProfileDto> =
    output<CreateProfileDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  // Computed signals
  private readonly matchingUsers: Signal<SystemUserResponseDto[]> = computed<
    SystemUserResponseDto[]
  >(() => {
    const term: string = this.userSearch().trim().toLowerCase();
    const users: SystemUserResponseDto[] = [...this.users()].sort(
      (a: SystemUserResponseDto, b: SystemUserResponseDto): number =>
        a.name.localeCompare(b.name),
    );
    return term
      ? users.filter((user: SystemUserResponseDto): boolean =>
          [user.name, user.phoneNumber, user.emailAddress ?? ''].some(
            (value: string): boolean => value.toLowerCase().includes(term),
          ),
        )
      : users;
  });

  protected readonly userOptions: Signal<SystemUserResponseDto[]> = computed<
    SystemUserResponseDto[]
  >(() => {
    const options: SystemUserResponseDto[] = this.matchingUsers().slice(
      0,
      MAX_USER_OPTIONS,
    );
    // Keep the chosen user selectable even when the search hides them.
    const selected: SystemUserResponseDto | undefined = this.selectedUser();
    return selected && !options.includes(selected)
      ? [selected, ...options]
      : options;
  });

  protected readonly hiddenUserCount: Signal<number> = computed<number>(() =>
    Math.max(0, this.matchingUsers().length - MAX_USER_OPTIONS),
  );

  protected readonly selectedUser: Signal<SystemUserResponseDto | undefined> =
    computed(() =>
      this.users().find(
        (user: SystemUserResponseDto): boolean =>
          user._id === this.form().systemUser,
      ),
    );

  /** A profile of the chosen type that the chosen user already has. */
  protected readonly duplicateProfile: Signal<ProfileResponseDto | undefined> =
    computed(() => {
      const { systemUser, type }: CreateLearnerProfileForm = this.form();
      return this.existingProfiles().find(
        (profile: ProfileResponseDto): boolean =>
          profile.systemUser === systemUser && profile.type === type,
      );
    });

  protected readonly availableGrades: Signal<GradeResponseDto[]> = computed<
    GradeResponseDto[]
  >(() => {
    const levelId: string = this.form().educationalLevel;
    return levelId
      ? this.grades()
          .filter(
            (grade: GradeResponseDto): boolean =>
              grade.educationalLevelId === levelId,
          )
          .sort(
            (a: GradeResponseDto, b: GradeResponseDto): number =>
              a.displayOrder - b.displayOrder,
          )
      : [];
  });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: CreateLearnerProfileForm = this.form();
    if (!form.systemUser || !form.image) {
      return false;
    }
    switch (form.type) {
      case ProfileType.STUDENT:
        return Boolean(form.educationalLevel) && Boolean(form.grade);
      case ProfileType.TUTOR:
        return form.bio.trim() !== '';
      default:
        return true;
    }
  });

  // Public methods
  protected updateForm<K extends keyof CreateLearnerProfileForm>(
    field: K,
    value: CreateLearnerProfileForm[K],
  ): void {
    this.form.update(
      (current: CreateLearnerProfileForm): CreateLearnerProfileForm => ({
        ...current,
        [field]: value,
        ...(field === 'educationalLevel' ? { grade: '' } : {}),
      }),
    );
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    this.create.emit(this.toDto(this.form()));
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }

  // Private methods
  /** Sends only the fields the chosen type takes. */
  private toDto(form: CreateLearnerProfileForm): CreateProfileDto {
    const base: { systemUser: string; image: string } = {
      systemUser: form.systemUser,
      image: form.image,
    };
    switch (form.type) {
      case ProfileType.STUDENT:
        return {
          ...base,
          type: ProfileType.STUDENT,
          educationalLevel: form.educationalLevel,
          grade: form.grade,
        };
      case ProfileType.TUTOR:
        return { ...base, type: ProfileType.TUTOR, bio: form.bio.trim() };
      default:
        return { ...base, type: ProfileType.ADMIN };
    }
  }
}
