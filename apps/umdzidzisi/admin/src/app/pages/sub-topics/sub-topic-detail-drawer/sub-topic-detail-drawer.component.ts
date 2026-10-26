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
  AccessLevel,
  ContentStatus,
  SubjectResponseDto,
  SubjectsStore,
  SubTopicResponseDto,
  SubTopicsStore,
  TopicResponseDto,
  TopicsStore,
  UpdateSubTopicDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { ArticlePickerComponent } from '../../../shared/components/article-picker/article-picker.component';
import { SubTopicForm } from '../../../shared/types/sub-topics/sub-topic-form.type';
import { isPositiveInteger } from '../../../shared/types/topics/is-positive-integer.const';
import { CONTENT_STATUS_OPTIONS } from '../../../shared/types/common/content-status-options.const';
import { CONTENT_STATUS_TONES } from '../../../shared/types/common/content-status-tones.const';
import { ACCESS_LEVEL_OPTIONS } from '../../../shared/types/common/access-level-options.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';

@Component({
  selector: 'org-sub-topic-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent, ArticlePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sub-topic-detail-drawer.component.html',
})
export class SubTopicDetailDrawerComponent {
  // Injected services
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof SubTopicsStore> =
    inject(SubTopicsStore);
  private readonly topicsStore: InstanceType<typeof TopicsStore> =
    inject(TopicsStore);
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  // State
  protected readonly statusOptions: SelectOption<ContentStatus>[] =
    CONTENT_STATUS_OPTIONS;
  protected readonly accessLevelOptions: SelectOption<AccessLevel>[] =
    ACCESS_LEVEL_OPTIONS;

  protected readonly subTopicsLoading: Signal<boolean> =
    this.store.subTopicsLoading;
  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<SubTopicForm | null> =
    signal(null);

  // Signal inputs
  public readonly subTopicId: InputSignal<string> = input.required<string>();

  // Computed signals
  protected readonly subTopic: Signal<SubTopicResponseDto | undefined> =
    computed<SubTopicResponseDto | undefined>(() =>
      this.store
        .subTopics()
        .find(
          (subTopic: SubTopicResponseDto): boolean =>
            subTopic._id === this.subTopicId(),
        ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () => CONTENT_STATUS_TONES[this.subTopic()?.status ?? ContentStatus.DRAFT],
  );

  /** Topics as "Topic · Subject" options, sorted by label. */
  protected readonly topicOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() => {
    const subjectNames: Map<string, string> = new Map(
      this.subjectsStore
        .subjects()
        .map((subject: SubjectResponseDto): [string, string] => [
          subject._id,
          subject.name,
        ]),
    );
    return this.topicsStore
      .topics()
      .map((topic: TopicResponseDto): SelectOption => {
        const subjectName: string | undefined = subjectNames.get(
          topic.subjectId,
        );
        return {
          value: topic._id,
          label: subjectName ? `${topic.name} · ${subjectName}` : topic.name,
        };
      })
      .sort((a: SelectOption, b: SelectOption): number =>
        a.label.localeCompare(b.label),
      );
  });

  protected readonly formValue: Signal<SubTopicForm> = computed<SubTopicForm>(
    () => {
      const edited: SubTopicForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const subTopic: SubTopicResponseDto | undefined = this.subTopic();
      return {
        topicId: subTopic?.topicId ?? '',
        name: subTopic?.name ?? '',
        learningObjectives: subTopic?.learningObjectives ?? '',
        estimatedDurationMinutes: subTopic?.estimatedDurationMinutes ?? 1,
        order: subTopic?.order ?? 1,
        articleId: subTopic?.articleId ?? '',
        status: subTopic?.status ?? ContentStatus.DRAFT,
        accessLevel: subTopic?.accessLevel ?? AccessLevel.PAID,
      };
    },
  );

  /** The backend ignores `articleId: null`, so a linked article can't be removed. */
  protected readonly hasLinkedArticle: Signal<boolean> = computed<boolean>(() =>
    Boolean(this.subTopic()?.articleId),
  );

  protected readonly articleTaken: Signal<boolean> = computed<boolean>(() => {
    const { topicId, articleId }: SubTopicForm = this.formValue();
    return (
      Boolean(articleId) &&
      this.store
        .subTopics()
        .some(
          (subTopic: SubTopicResponseDto): boolean =>
            subTopic._id !== this.subTopicId() &&
            subTopic.topicId === topicId &&
            subTopic.articleId === articleId,
        )
    );
  });

  protected readonly isDirty: Signal<boolean> = computed<boolean>(
    () => this.editedForm() !== null,
  );

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: SubTopicForm = this.formValue();
    return (
      Boolean(form.topicId) &&
      Boolean(form.name.trim()) &&
      Boolean(form.learningObjectives.trim()) &&
      isPositiveInteger(form.estimatedDurationMinutes) &&
      isPositiveInteger(form.order)
    );
  });

  public constructor() {
    this.store.loadSubTopics();
    this.topicsStore.loadTopics();
    this.subjectsStore.loadSubjects();
  }

  // Public methods
  protected updateForm<K extends keyof SubTopicForm>(
    field: K,
    value: SubTopicForm[K],
  ): void {
    // Never clear a linked article: the API would silently keep the old one.
    if (field === 'articleId' && !value && this.hasLinkedArticle()) {
      return;
    }
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveSubTopic(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const form: SubTopicForm = this.formValue();
    const dto: UpdateSubTopicDto = {
      topicId: form.topicId,
      name: form.name.trim(),
      learningObjectives: form.learningObjectives.trim(),
      estimatedDurationMinutes: form.estimatedDurationMinutes as number,
      order: form.order as number,
      status: form.status,
      accessLevel: form.accessLevel,
      ...(form.articleId ? { articleId: form.articleId } : {}),
    };
    this.store.updateSubTopic(this.subTopicId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Sub-topic saved.',
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
