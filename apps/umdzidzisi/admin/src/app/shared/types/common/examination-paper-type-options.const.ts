import { ExaminationPaperType } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const EXAMINATION_PAPER_TYPE_OPTIONS: SelectOption<ExaminationPaperType>[] =
  [
    { value: ExaminationPaperType.MULTIPLE_CHOICE, label: 'Multiple choice' },
    { value: ExaminationPaperType.THEORY, label: 'Theory' },
    { value: ExaminationPaperType.PRACTICAL, label: 'Practical' },
    {
      value: ExaminationPaperType.STRUCTURED_QUESTIONS,
      label: 'Structured questions',
    },
    { value: ExaminationPaperType.PROBLEM_SOLVING, label: 'Problem solving' },
  ];
