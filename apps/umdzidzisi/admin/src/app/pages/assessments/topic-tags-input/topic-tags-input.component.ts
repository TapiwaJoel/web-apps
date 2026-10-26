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

/**
 * Chip input for an assessment's topic tags. Enter or comma adds a tag,
 * Backspace on an empty draft removes the last one. Duplicates are ignored.
 */
@Component({
  selector: 'org-topic-tags-input',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-tags-input.component.html',
})
export class TopicTagsInputComponent {
  protected readonly draft: WritableSignal<string> = signal('');

  public readonly value: InputSignal<string[]> = input<string[]>([]);
  public readonly max: InputSignal<number> = input<number>(20);
  public readonly inputId: InputSignal<string> = input<string>('topic-tags');

  public readonly valueChange: OutputEmitterRef<string[]> = output<string[]>();

  protected readonly isFull: Signal<boolean> = computed<boolean>(
    () => this.value().length >= this.max(),
  );

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commitDraft();
    } else if (event.key === 'Backspace' && this.draft() === '') {
      const tags: string[] = this.value();
      if (tags.length > 0) {
        this.valueChange.emit(tags.slice(0, -1));
      }
    }
  }

  protected commitDraft(): void {
    const tag: string = this.draft().trim();
    this.draft.set('');
    if (!tag || this.isFull() || this.value().includes(tag)) {
      return;
    }
    this.valueChange.emit([...this.value(), tag]);
  }

  protected removeTag(tag: string): void {
    this.valueChange.emit(
      this.value().filter((existing: string) => existing !== tag),
    );
  }
}
