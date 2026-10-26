/** Backend length limits for examination paper text fields. */
export const EXAMINATION_PAPER_LIMITS: {
  readonly name: number;
  readonly description: number;
} = {
  name: 255,
  description: 10000,
};
