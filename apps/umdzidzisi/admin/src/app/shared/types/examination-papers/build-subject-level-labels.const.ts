import {
  EducationalLevelResponseDto,
  SubjectResponseDto,
} from '@mushaviri/api';

/**
 * Maps each subject id to "Subject · Level". The level part is dropped while
 * the levels store hasn't resolved that level yet.
 */
export const buildSubjectLevelLabels: (
  subjects: SubjectResponseDto[],
  levels: EducationalLevelResponseDto[],
) => Map<string, string> = (
  subjects: SubjectResponseDto[],
  levels: EducationalLevelResponseDto[],
): Map<string, string> => {
  const levelNames: Map<string, string> = new Map(
    levels.map((level: EducationalLevelResponseDto): [string, string] => [
      level._id,
      level.name,
    ]),
  );
  return new Map(
    subjects.map((subject: SubjectResponseDto): [string, string] => {
      const levelName: string | undefined = levelNames.get(
        subject.educationalLevelId,
      );
      return [
        subject._id,
        levelName ? `${subject.name} · ${levelName}` : subject.name,
      ];
    }),
  );
};
