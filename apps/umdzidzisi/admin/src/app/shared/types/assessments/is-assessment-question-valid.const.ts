import { CreateAssessmentQuestionDto } from '@mushaviri/api';
import { ASSESSMENT_LIMITS } from './assessment-limits.const';

function isNonNegative(value: number | null | undefined): boolean {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(value) &&
    value >= 0
  );
}

/** Mirrors the backend's rules for one question entry of an assessment. */
export const isAssessmentQuestionValid: (
  question: CreateAssessmentQuestionDto,
) => boolean = (question: CreateAssessmentQuestionDto): boolean =>
  Boolean(question.questionId) &&
  isNonNegative(question.marks) &&
  isNonNegative(question.timeAllowed) &&
  isNonNegative(question.order) &&
  (question.sectionLabel ?? '').length <= ASSESSMENT_LIMITS.sectionLabel &&
  (question.questionNumber ?? '').length <= ASSESSMENT_LIMITS.questionNumber;
