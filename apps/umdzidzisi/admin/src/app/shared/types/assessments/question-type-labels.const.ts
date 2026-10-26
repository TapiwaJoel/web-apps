import { QuestionType } from '@mushaviri/api';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.MULTIPLE_CHOICE]: 'Multiple choice',
  [QuestionType.MULTIPLE_RESPONSE]: 'Multiple response',
  [QuestionType.TRUE_FALSE]: 'True / false',
  [QuestionType.MATCHING]: 'Matching',
  [QuestionType.FILL_BLANK]: 'Fill in the blank',
  [QuestionType.FREE_TEXT]: 'Free text',
};
