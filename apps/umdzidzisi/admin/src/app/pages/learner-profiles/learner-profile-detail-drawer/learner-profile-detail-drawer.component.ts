import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  EntityStatus,
  GradeResponseDto,
  GradesStore,
  ProfileResponseDto,
  ProfilesStore,
  ProfileType,
  SystemUserResponseDto,
  UpdateProfileDto,
  UsersStore,
} from '@mushaviri/api';
import { ADMIN_SERVICE_NAME } from '@mushaviri/util';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { CmsImagePickerComponent } from '../../../shared/components/cms-image-picker/cms-image-picker.component';
import { LearnerProfileEditForm } from '../../../shared/types/learner-profiles/learner-profile-edit-form.type';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { ENTITY_STATUS_OPTIONS } from '../../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../../shared/types/common/entity-status-tones.const';

/**
 * Edits a profile within the backend's per-type rules: tutors may only change
 * their bio, admins can't have a level or grade, students can change level and
 * grade, and every type can change status.
 */
@Component({
  selector: 'org-learner-profile-detail-drawer',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    StatusPillComponent,
    CmsImagePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './learner-profile-detail-drawer.component.html',
})
export class LearnerProfileDetailDrawerComponent {
  // Injected services
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof ProfilesStore> =
    inject(ProfilesStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
  private readonly gradesStore: InstanceType<typeof GradesStore> =
    inject(GradesStore);
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  // State
  protected readonly ProfileType: typeof ProfileType = ProfileType;
  protected readonly statusOptions: SelectOption<EntityStatus>[] =
    ENTITY_STATUS_OPTIONS;
  protected readonly profilesLoading: Signal<boolean> =
    this.store.profilesLoading;
  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.educationalLevelsStore.educationalLevels;
  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<LearnerProfileEditForm | null> =
    signal(null);

  // Signal inputs
  public readonly profileId: InputSignal<string> = input.required<string>();

  // Computed signals
  protected readonly profile: Signal<ProfileResponseDto | undefined> = computed(
    () =>
      this.store
        .profiles()
        .find(
          (profile: ProfileResponseDto): boolean =>
            profile._id === this.profileId(),
        ),
  );

  protected readonly user: Signal<SystemUserResponseDto | undefined> = computed(
    () =>
      this.usersStore
        .users()
        .find(
          (user: SystemUserResponseDto): boolean =>
            user._id === this.profile()?.systemUser,
        ),
  );

  protected readonly typeLabel: Signal<string> = computed<string>(
    () => this.profile()?.type ?? '',
  );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () => ENTITY_STATUS_TONES[this.profile()?.status ?? EntityStatus.ACTIVE],
  );

  /** Tutors may only change their bio (and, like every type, status). */
  protected readonly canEditImage: Signal<boolean> = computed<boolean>(
    () => this.profile()?.type !== ProfileType.TUTOR,
  );
  /** Only students have a level and grade. */
  protected readonly canEditLevel: Signal<boolean> = computed<boolean>(
    () => this.profile()?.type === ProfileType.STUDENT,
  );
  protected readonly canEditBio: Signal<boolean> = computed<boolean>(
    () => this.profile()?.type === ProfileType.TUTOR,
  );

  protected readonly formValue: Signal<LearnerProfileEditForm> =
    computed<LearnerProfileEditForm>(() => {
      const edited: LearnerProfileEditForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const profile: ProfileResponseDto | undefined = this.profile();
      return {
        image: profile?.image ?? '',
        educationalLevel: profile?.educationalLevel ?? '',
        grade: profile?.grade ?? '',
        bio: profile?.bio ?? '',
        status: profile?.status ?? EntityStatus.ACTIVE,
      };
    });

  protected readonly availableGrades: Signal<GradeResponseDto[]> = computed<
    GradeResponseDto[]
  >(() => {
    const levelId: string = this.formValue().educationalLevel;
    return levelId
      ? this.gradesStore
          .grades()
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

  protected readonly isDirty: Signal<boolean> = computed<boolean>(
    () => this.editedForm() !== null,
  );

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: LearnerProfileEditForm = this.formValue();
    switch (this.profile()?.type) {
      case ProfileType.STUDENT:
        return Boolean(form.image && form.educationalLevel && form.grade);
      case ProfileType.TUTOR:
        return form.bio.trim() !== '';
      default:
        return Boolean(form.image);
    }
  });

  // Constructor
  public constructor() {
    this.store.loadProfiles();
    this.educationalLevelsStore.loadEducationalLevels();
    this.gradesStore.loadGrades();
    this.usersStore.loadUsers({ serviceName: this.serviceName });
  }

  // Public methods
  protected updateForm<K extends keyof LearnerProfileEditForm>(
    field: K,
    value: LearnerProfileEditForm[K],
  ): void {
    this.editedForm.set({
      ...this.formValue(),
      [field]: value,
      ...(field === 'educationalLevel' ? { grade: '' } : {}),
    });
  }

  protected saveProfile(): void {
    const profile: ProfileResponseDto | undefined = this.profile();
    if (!profile || !this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.store.updateProfile(profile._id, this.toDto(profile.type), {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Profile changes saved.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected close(): void {
    void this.router.navigate(['../'], { relativeTo: this.route });
  }

  // Private methods
  /** Sends only the fields the backend lets this profile type change. */
  private toDto(type: ProfileType): UpdateProfileDto {
    const form: LearnerProfileEditForm = this.formValue();
    switch (type) {
      case ProfileType.TUTOR:
        return { bio: form.bio.trim(), status: form.status };
      case ProfileType.STUDENT:
        return {
          image: form.image,
          educationalLevel: form.educationalLevel,
          grade: form.grade,
          status: form.status,
        };
      default:
        return { image: form.image, status: form.status };
    }
  }
}
