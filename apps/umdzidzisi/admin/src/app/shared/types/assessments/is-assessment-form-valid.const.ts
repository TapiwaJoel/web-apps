import { AssessmentForm } from './assessment-form.type';
import { ASSESSMENT_LIMITS } from './assessment-limits.const';

/** Mirrors the backend's required-field and length rules for assessments. */
export const isAssessmentFormValid: (form: AssessmentForm) => boolean = (
  form: AssessmentForm,
): boolean => {
  const title: string = form.title.trim();
  return (
    Boolean(form.examinationPaperId) &&
    form.educationalLevel.trim().length > 0 &&
    title.length > 0 &&
    title.length <= ASSESSMENT_LIMITS.title &&
    form.description.trim().length <= ASSESSMENT_LIMITS.description &&
    form.topicTags.length <= ASSESSMENT_LIMITS.topicTags
  );
};
