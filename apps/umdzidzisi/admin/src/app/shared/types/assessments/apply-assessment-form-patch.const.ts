import { AssessmentForm } from './assessment-form.type';

/**
 * Applies a field patch with the form's cascades: changing the paper resets
 * the topic and sub-topic and prefills the level from the paper's subject;
 * changing the topic resets the sub-topic.
 */
export const applyAssessmentFormPatch: (
  current: AssessmentForm,
  patch: Partial<AssessmentForm>,
  levelNameForPaper: (paperId: string) => string,
) => AssessmentForm = (
  current: AssessmentForm,
  patch: Partial<AssessmentForm>,
  levelNameForPaper: (paperId: string) => string,
): AssessmentForm => {
  const next: AssessmentForm = { ...current, ...patch };
  if (
    patch.examinationPaperId !== undefined &&
    patch.examinationPaperId !== current.examinationPaperId
  ) {
    next.topicId = '';
    next.subTopicId = '';
    next.educationalLevel =
      levelNameForPaper(patch.examinationPaperId) || current.educationalLevel;
  }
  if (patch.topicId !== undefined && patch.topicId !== current.topicId) {
    next.subTopicId = '';
  }
  return next;
};
