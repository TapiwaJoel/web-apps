/** One positioned band of the 0–100 grading-scale range bar. */
export interface GradingScaleSegment {
  id: string;
  symbol: string;
  minimumScore: number;
  maximumScore: number;
  /** Width of the band, as a percentage of the track. */
  width: number;
  /** `band from-N len-M` classes that position the band on the track. */
  positionClass: string;
  /** Tailwind background + text classes for the band. */
  shadeClass: string;
}
