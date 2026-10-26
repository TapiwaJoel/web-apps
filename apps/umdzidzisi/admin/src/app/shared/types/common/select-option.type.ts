/** A `<select>` option: the enum/raw value submitted, and its display label. */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}
