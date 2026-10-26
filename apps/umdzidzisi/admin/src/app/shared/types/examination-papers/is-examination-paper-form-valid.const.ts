import { ExaminationPaperForm } from './examination-paper-form.type';
import { EXAMINATION_PAPER_LIMITS } from './examination-paper-limits.const';

function isPositive(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value > 0;
}

/** Mirrors the backend's required-field and length rules for papers. */
export const isExaminationPaperFormValid: (
  form: ExaminationPaperForm,
) => boolean = (form: ExaminationPaperForm): boolean => {
  const name: string = form.name.trim();
  const description: string = form.description.trim();
  return (
    Boolean(form.subjectId) &&
    name.length > 0 &&
    name.length <= EXAMINATION_PAPER_LIMITS.name &&
    description.length > 0 &&
    description.length <= EXAMINATION_PAPER_LIMITS.description &&
    form.type !== '' &&
    isPositive(form.numberOfQuestions) &&
    isPositive(form.duration) &&
    isPositive(form.marks)
  );
};
