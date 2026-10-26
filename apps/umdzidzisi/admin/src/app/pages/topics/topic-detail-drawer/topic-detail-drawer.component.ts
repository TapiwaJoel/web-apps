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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ContentStatus,
  GradeResponseDto,
  GradesStore,
  SubjectResponseDto,
  SubjectsStore,
  TopicResponseDto,
  TopicsStore,
  UpdateTopicDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { TopicForm } from '../../../shared/types/topics/topic-form.type';
import { isPositiveInteger } from '../../../shared/types/topics/is-positive-integer.const';
import { CONTENT_STATUS_OPTIONS } from '../../../shared/types/common/content-status-options.const';
import { CONTENT_STATUS_TONES } from '../../../shared/types/common/content-status-tones.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';

@Component({
  selector: 'org-topic-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-detail-drawer.component.html',
})
export class TopicDetailDrawerComponent {
  // Injected services
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof TopicsStore> =
    inject(TopicsStore);
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly gradesStore: InstanceType<typeof GradesStore> =
    inject(GradesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  // State
  protected readonly statusOptions: SelectOption<ContentStatus>[] =
    CONTENT_STATUS_OPTIONS;
  /** The `curriculum` section route; child-list links resolve against it. */
  protected readonly curriculumRoute: ActivatedRoute | null = this.route.parent;

  protected readonly topicsLoading: Signal<boolean> = this.store.topicsLoading;
  protected readonly subjects: Signal<SubjectResponseDto[]> =
    this.subjectsStore.subjects;
  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<TopicForm | null> = signal(null);

  // Signal inputs
  public readonly topicId: InputSignal<string> = input.required<string>();

  // Computed signals
  protected readonly topic: Signal<TopicResponseDto | undefined> = computed<
    TopicResponseDto | undefined
  >(() =>
    this.store
      .topics()
      .find((topic: TopicResponseDto): boolean => topic._id === this.topicId()),
  );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () => CONTENT_STATUS_TONES[this.topic()?.status ?? ContentStatus.DRAFT],
  );

  protected readonly formValue: Signal<TopicForm> = computed<TopicForm>(() => {
    const edited: TopicForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const topic: TopicResponseDto | undefined = this.topic();
    return {
      subjectId: topic?.subjectId ?? '',
      gradeId: topic?.gradeId ?? '',
      name: topic?.name ?? '',
      order: topic?.order ?? 1,
      status: topic?.status ?? ContentStatus.DRAFT,
    };
  });

  /** Only grades at the chosen subject's educational level. */
  protected readonly availableGrades: Signal<GradeResponseDto[]> = computed<
    GradeResponseDto[]
  >(() => {
    const levelId: string | undefined = this.subjects().find(
      (subject: SubjectResponseDto): boolean =>
        subject._id === this.formValue().subjectId,
    )?.educationalLevelId;
    return this.gradesStore
      .grades()
      .filter(
        (grade: GradeResponseDto): boolean =>
          grade.educationalLevelId === levelId,
      )
      .sort(
        (a: GradeResponseDto, b: GradeResponseDto): number =>
          a.displayOrder - b.displayOrder,
      );
  });

  protected readonly orderTaken: Signal<boolean> = computed<boolean>(() => {
    const { subjectId, gradeId, order }: TopicForm = this.formValue();
    return this.store
      .topics()
      .some(
        (topic: TopicResponseDto): boolean =>
          topic._id !== this.topicId() &&
          topic.subjectId === subjectId &&
          topic.gradeId === gradeId &&
          topic.order === order,
      );
  });

  protected readonly isDirty: Signal<boolean> = computed<boolean>(
    () => this.editedForm() !== null,
  );

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: TopicForm = this.formValue();
    return (
      Boolean(form.subjectId) &&
      Boolean(form.gradeId) &&
      Boolean(form.name.trim()) &&
      isPositiveInteger(form.order)
    );
  });

  public constructor() {
    this.store.loadTopics();
    this.subjectsStore.loadSubjects();
    this.gradesStore.loadGrades();
  }

  // Public methods
  protected updateForm<K extends keyof TopicForm>(
    field: K,
    value: TopicForm[K],
  ): void {
    this.editedForm.set({
      ...this.formValue(),
      [field]: value,
      ...(field === 'subjectId' ? { gradeId: '' } : {}),
    });
  }

  protected saveTopic(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const form: TopicForm = this.formValue();
    const dto: UpdateTopicDto = {
      subjectId: form.subjectId,
      gradeId: form.gradeId,
      name: form.name.trim(),
      order: form.order as number,
      status: form.status,
    };
    this.store.updateTopic(this.topicId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Topic saved.',
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
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }
}
