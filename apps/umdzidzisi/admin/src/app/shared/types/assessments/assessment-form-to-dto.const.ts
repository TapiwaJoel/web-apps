import { CreateAssessmentDto } from '@mushaviri/api';
import { AssessmentForm } from './assessment-form.type';

/**
 * Maps the form to the request body. Optional ids are omitted when empty,
 * since the backend rejects '' for Mongo ids (so they can't be unset via
 * PATCH either).
 */
export const assessmentFormToDto: (
  form: AssessmentForm,
) => CreateAssessmentDto = (form: AssessmentForm): CreateAssessmentDto => ({
  examinationPaperId: form.examinationPaperId,
  educationalLevel: form.educationalLevel.trim(),
  title: form.title.trim(),
  description: form.description.trim(),
  ...(form.topicId ? { topicId: form.topicId } : {}),
  ...(form.subTopicId ? { subTopicId: form.subTopicId } : {}),
  topicTags: form.topicTags,
  status: form.status,
});
