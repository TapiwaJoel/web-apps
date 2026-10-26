import {
  ExaminationPaperResponseDto,
  SubjectResponseDto,
  SubTopicResponseDto,
  TopicResponseDto,
} from '@mushaviri/api';
import { SelectOption } from '../common/select-option.type';
import { AssessmentForm } from './assessment-form.type';
import { AssessmentLookups } from './assessment-lookups.type';
import { AssessmentSelectOptions } from './assessment-select-options.type';

const byLabel: (a: SelectOption, b: SelectOption) => number = (
  a: SelectOption,
  b: SelectOption,
): number => a.label.localeCompare(b.label);

/**
 * Builds the paper / topic / sub-topic options for a form: topics are limited
 * to the selected paper's subject and sub-topics to the selected topic.
 */
export const buildAssessmentSelectOptions: (
  lookups: AssessmentLookups,
  form: AssessmentForm,
) => AssessmentSelectOptions = (
  lookups: AssessmentLookups,
  form: AssessmentForm,
): AssessmentSelectOptions => {
  const subjectNames: Map<string, string> = new Map(
    lookups.subjects.map((subject: SubjectResponseDto): [string, string] => [
      subject._id,
      subject.name,
    ]),
  );
  const paper: ExaminationPaperResponseDto | undefined = lookups.papers.find(
    (candidate: ExaminationPaperResponseDto) =>
      candidate._id === form.examinationPaperId,
  );
  return {
    papers: lookups.papers
      .map((candidate: ExaminationPaperResponseDto): SelectOption => ({
        value: candidate._id,
        label: `${candidate.name} · ${subjectNames.get(candidate.subjectId) ?? candidate.subjectId}`,
      }))
      .sort(byLabel),
    topics: paper
      ? lookups.topics
          .filter(
            (topic: TopicResponseDto) => topic.subjectId === paper.subjectId,
          )
          .sort((a: TopicResponseDto, b: TopicResponseDto) => a.order - b.order)
          .map((topic: TopicResponseDto): SelectOption => ({
            value: topic._id,
            label: topic.name,
          }))
      : [],
    subTopics: form.topicId
      ? lookups.subTopics
          .filter(
            (subTopic: SubTopicResponseDto) =>
              subTopic.topicId === form.topicId,
          )
          .sort(
            (a: SubTopicResponseDto, b: SubTopicResponseDto) =>
              a.order - b.order,
          )
          .map((subTopic: SubTopicResponseDto): SelectOption => ({
            value: subTopic._id,
            label: subTopic.name,
          }))
      : [],
  };
};
