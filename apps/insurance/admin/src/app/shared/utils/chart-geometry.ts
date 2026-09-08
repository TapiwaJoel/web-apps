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
  return points.map((value: number, i: number): BarRect => {
    const ratio: number = max === 0 ? 0 : value / max;
    const h: number = ratio * height;
    const x: number = i * (barWidth + gap);
    return { x, y: height - h, w: barWidth, h };
  });
}
