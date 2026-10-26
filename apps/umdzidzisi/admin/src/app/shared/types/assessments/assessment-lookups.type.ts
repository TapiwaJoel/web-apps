import {
  EducationalLevelResponseDto,
  ExaminationPaperResponseDto,
  SubjectResponseDto,
  SubTopicResponseDto,
  TopicResponseDto,
} from '@mushaviri/api';

/** The parent records the assessment form's selects are built from. */
export interface AssessmentLookups {
  papers: ExaminationPaperResponseDto[];
  subjects: SubjectResponseDto[];
  levels: EducationalLevelResponseDto[];
  topics: TopicResponseDto[];
  subTopics: SubTopicResponseDto[];
}
