/**
 * Build an SVG path `d` for a sparkline polyline that fills the given box.
 * Values are y-inverted (larger value = higher on screen). A flat series
 * sits on the vertical midline. Empty/single-point series returns ''.
 */
export function sparklinePath(
  series: number[],
  width: number,
  height: number,
): string {
  if (series.length < 2) {
    return '';
  }
  const min: number = Math.min(...series);
  const max: number = Math.max(...series);
  const span: number = max - min;
  const stepX: number = width / (series.length - 1);
  const points: string[] = series.map((value, i) => {
    const x: number = i * stepX;
    const ratio: number = span === 0 ? 0.5 : (value - min) / span;
    const y: number = height - ratio * height;
    return `${x} ${y}`;
  });
  return `M ${points[0]} ${points
    .slice(1)
    .map((p: string) => `L ${p}`)
    .join(' ')}`;
}

export interface BarRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Lay out proportional, bottom-anchored bars across the box. Bars share equal
 * width with `gap` px between them; heights are proportional to the series max.
 * Empty series returns [].
 */
export function barLayout(
  points: number[],
  width: number,
  height: number,
  gap: number = 8,
): BarRect[] {
  if (points.length === 0) {
    return [];
  }
  const max: number = Math.max(...points);
  const totalGap: number = gap * (points.length - 1);
  const barWidth: number = (width - totalGap) / points.length;
  return points.map((value, i) => {
    const ratio: number = max === 0 ? 0 : value / max;
    const h: number = ratio * height;
    const x: number = i * (barWidth + gap);
    return { x, y: height - h, w: barWidth, h };
  });
}
