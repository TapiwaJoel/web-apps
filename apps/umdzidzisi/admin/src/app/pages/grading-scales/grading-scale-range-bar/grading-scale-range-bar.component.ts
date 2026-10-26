import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { EntityStatus, GradingScaleResponseDto } from '@mushaviri/api';
import { GradingScaleSegment } from '../../../shared/types/grading-scales/grading-scale-segment.type';
import { GRADING_SCALE_SEGMENT_SHADES } from '../../../shared/types/grading-scales/grading-scale-segment-shades.const';

/** Scores are inclusive integers, so 0–100 spans 101 slots. */
const SCORE_SLOTS: number = 101;
/** Bands narrower than this (percent of the track) hide their symbol. */
const MIN_LABEL_WIDTH: number = 5;

/**
 * Presentational 0–100 bar showing where each grading scale's inclusive
 * score range sits. Uncovered scores show as empty track, and overlapping
 * ranges visibly stack.
 */
@Component({
  selector: 'org-grading-scale-range-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grading-scale-range-bar.component.html',
  styleUrl: './grading-scale-range-bar.component.scss',
})
export class GradingScaleRangeBarComponent {
  public readonly scales: InputSignal<GradingScaleResponseDto[]> = input<
    GradingScaleResponseDto[]
  >([]);
  /** Hides the per-band legend under the bar. */
  public readonly compact: InputSignal<boolean> = input(false);

  protected readonly minLabelWidth: number = MIN_LABEL_WIDTH;

  protected readonly segments: Signal<GradingScaleSegment[]> = computed<
    GradingScaleSegment[]
  >(() =>
    this.scales()
      .filter(
        (scale: GradingScaleResponseDto): boolean =>
          scale.status !== EntityStatus.DELETED,
      )
      .sort(
        (a: GradingScaleResponseDto, b: GradingScaleResponseDto): number =>
          b.maximumScore - a.maximumScore,
      )
      .map(
        (
          scale: GradingScaleResponseDto,
          index: number,
        ): GradingScaleSegment => {
          const min: number = Math.round(
            clampScore(Math.min(scale.minimumScore, scale.maximumScore)),
          );
          const max: number = Math.round(
            clampScore(Math.max(scale.minimumScore, scale.maximumScore)),
          );
          const span: number = max - min + 1;
          return {
            id: scale._id,
            symbol: scale.symbol,
            minimumScore: scale.minimumScore,
            maximumScore: scale.maximumScore,
            width: (span / SCORE_SLOTS) * 100,
            positionClass: `band from-${min} len-${span}`,
            shadeClass:
              GRADING_SCALE_SEGMENT_SHADES[
                Math.min(index, GRADING_SCALE_SEGMENT_SHADES.length - 1)
              ],
          };
        },
      ),
  );

  protected readonly coveredScores: Signal<number> = computed<number>(() => {
    const covered: Set<number> = new Set<number>();
    for (const segment of this.segments()) {
      const from: number = Math.ceil(
        clampScore(Math.min(segment.minimumScore, segment.maximumScore)),
      );
      const to: number = Math.floor(
        clampScore(Math.max(segment.minimumScore, segment.maximumScore)),
      );
      for (let score: number = from; score <= to; score++) {
        covered.add(score);
      }
    }
    return covered.size;
  });

  protected readonly ariaLabel: Signal<string> = computed<string>(() => {
    const bands: string = this.segments()
      .map(
        (segment: GradingScaleSegment): string =>
          `${segment.symbol} ${segment.minimumScore} to ${segment.maximumScore}`,
      )
      .join(', ');
    return bands ? `Score bands: ${bands}` : 'No score bands';
  });
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}
