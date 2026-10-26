import {
  EducationalLevelResponseDto,
  ExaminationPaperResponseDto,
  SubjectResponseDto,
} from '@mushaviri/api';
import { AssessmentLookups } from './assessment-lookups.type';

/**
 * Resolves paper → subject → educational level name, used to prefill an
 * assessment's free-text `educationalLevel`. Returns '' when unresolved.
 */
export const resolvePaperLevelName: (
  lookups: AssessmentLookups,
  paperId: string,
) => string = (lookups: AssessmentLookups, paperId: string): string => {
  const paper: ExaminationPaperResponseDto | undefined = lookups.papers.find(
    (candidate: ExaminationPaperResponseDto) => candidate._id === paperId,
  );
  const subject: SubjectResponseDto | undefined = paper
    ? lookups.subjects.find(
        (candidate: SubjectResponseDto) => candidate._id === paper.subjectId,
      )
    : undefined;
  const level: EducationalLevelResponseDto | undefined = subject
    ? lookups.levels.find(
        (candidate: EducationalLevelResponseDto) =>
          candidate._id === subject.educationalLevelId,
      )
    : undefined;
  return level?.name ?? '';
};
