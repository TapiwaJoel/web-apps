/** Backend validation limits for assessments and their question entries. */
export const ASSESSMENT_LIMITS: {
  readonly title: number;
  readonly description: number;
  readonly topicTags: number;
  readonly sectionLabel: number;
  readonly questionNumber: number;
} = {
  title: 200,
  description: 1000,
  topicTags: 20,
  sectionLabel: 50,
  questionNumber: 20,
};
