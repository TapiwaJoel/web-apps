import { sparklinePath, barLayout, BarRect } from './chart-geometry';

describe('sparklinePath', () => {
  it('returns empty string for empty or single-point series', () => {
    expect(sparklinePath([], 100, 20)).toBe('');
    expect(sparklinePath([5], 100, 20)).toBe('');
  });

  it('maps first and last points to the box edges, y-inverted', () => {
    const d: string = sparklinePath([0, 10], 100, 20);
    // first point at x=0, min value -> bottom (y=20); last at x=100, max -> top (y=0)
    expect(d).toBe('M 0 20 L 100 0');
  });

  it('places a flat series along the vertical midline', () => {
    const d: string = sparklinePath([5, 5, 5], 100, 20);
    // flat -> all at mid height (10)
    expect(d).toBe('M 0 10 L 50 10 L 100 10');
  });
});

describe('barLayout', () => {
  it('returns empty array for empty series', () => {
    expect(barLayout([], 100, 40)).toEqual([]);
  });

  it('produces one full-height bar for the max value, anchored to bottom', () => {
    const bars: BarRect[] = barLayout([10], 100, 40, 0);
    expect(bars).toEqual([{ x: 0, y: 0, w: 100, h: 40 }]);
  });

  it('scales bar heights proportionally to the series max', () => {
    const bars: BarRect[] = barLayout([5, 10], 100, 40, 0);
    expect(bars[0]).toEqual({ x: 0, y: 20, w: 50, h: 20 }); // half height
    expect(bars[1]).toEqual({ x: 50, y: 0, w: 50, h: 40 }); // full height
  });

  it('applies the gap between bars', () => {
    const bars: BarRect[] = barLayout([10, 10], 100, 40, 10);
    // total gap = 10 * (2-1) = 10, so each bar w = (100-10)/2 = 45
    expect(bars[0].w).toBe(45);
    expect(bars[1].x).toBe(55);
  });
});
