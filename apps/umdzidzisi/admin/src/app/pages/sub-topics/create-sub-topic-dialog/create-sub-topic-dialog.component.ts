import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateSubTopicDto, SubTopicResponseDto } from '@mushaviri/api';
import { ArticlePickerComponent } from '../../../shared/components/article-picker/article-picker.component';
import { CreateSubTopicForm } from '../../../shared/types/sub-topics/create-sub-topic-form.type';
import { EMPTY_CREATE_SUB_TOPIC_FORM } from '../../../shared/types/sub-topics/empty-create-sub-topic-form.const';
import { isPositiveInteger } from '../../../shared/types/topics/is-positive-integer.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';

@Component({
  selector: 'org-create-sub-topic-dialog',
  standalone: true,
  imports: [FormsModule, ArticlePickerComponent],
  templateUrl: './create-sub-topic-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSubTopicDialogComponent implements OnInit {
  // State
  protected readonly form: WritableSignal<CreateSubTopicForm> = signal({
    ...EMPTY_CREATE_SUB_TOPIC_FORM,
  });

  // Signal inputs
  /** Topics as "Topic · Subject" options. */
  public readonly topicOptions: InputSignal<SelectOption[]> = input<
    SelectOption[]
  >([]);
  /** Existing sub-topics, for next-order and uniqueness hints. */
  public readonly subTopics: InputSignal<SubTopicResponseDto[]> = input<
    SubTopicResponseDto[]
  >([]);
  public readonly initialTopicId: InputSignal<string> = input<string>('');
  public readonly creating: InputSignal<boolean> = input(false);

  // Signal outputs
  public readonly create: OutputEmitterRef<CreateSubTopicDto> =
    output<CreateSubTopicDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  // Computed signals
  private readonly siblings: Signal<SubTopicResponseDto[]> = computed<
    SubTopicResponseDto[]
  >(() => {
    const topicId: string = this.form().topicId;
    return this.subTopics().filter(
      (subTopic: SubTopicResponseDto): boolean => subTopic.topicId === topicId,
    );
  });

  protected readonly nameTaken: Signal<boolean> = computed<boolean>(() => {
    const name: string = this.form().name.trim().toLowerCase();
    return (
      Boolean(name) &&
      this.siblings().some(
        (subTopic: SubTopicResponseDto): boolean =>
          subTopic.name.trim().toLowerCase() === name,
      )
    );
  });

  protected readonly articleTaken: Signal<boolean> = computed<boolean>(() => {
    const articleId: string = this.form().articleId;
    return (
      Boolean(articleId) &&
      this.siblings().some(
        (subTopic: SubTopicResponseDto): boolean =>
          subTopic.articleId === articleId,
      )
    );
  });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: CreateSubTopicForm = this.form();
    return (
      Boolean(form.topicId) &&
      Boolean(form.name.trim()) &&
      Boolean(form.learningObjectives.trim()) &&
      isPositiveInteger(form.estimatedDurationMinutes) &&
      isPositiveInteger(form.order)
    );
  });

  // Lifecycle hooks
  public ngOnInit(): void {
    const topicId: string = this.topicOptions().some(
      (option: SelectOption): boolean => option.value === this.initialTopicId(),
    )
      ? this.initialTopicId()
      : '';
    this.form.set({
      ...EMPTY_CREATE_SUB_TOPIC_FORM,
      topicId,
      order: this.nextOrder(topicId),
    });
  }

  // Public methods
  protected updateForm<K extends keyof CreateSubTopicForm>(
    field: K,
    value: CreateSubTopicForm[K],
  ): void {
    this.form.update((current: CreateSubTopicForm): CreateSubTopicForm => ({
      ...current,
      [field]: value,
      ...(field === 'topicId'
        ? { order: this.nextOrder(value as string) }
        : {}),
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const form: CreateSubTopicForm = this.form();
    this.create.emit({
      topicId: form.topicId,
      name: form.name.trim(),
      learningObjectives: form.learningObjectives.trim(),
      estimatedDurationMinutes: form.estimatedDurationMinutes as number,
      order: form.order as number,
      ...(form.articleId ? { articleId: form.articleId } : {}),
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }

  // Private methods
  private nextOrder(topicId: string): number {
    const orders: number[] = this.subTopics()
      .filter(
        (subTopic: SubTopicResponseDto): boolean =>
          subTopic.topicId === topicId,
      )
      .map((subTopic: SubTopicResponseDto): number => subTopic.order);
    return orders.length === 0 ? 1 : Math.max(...orders) + 1;
  }
}
