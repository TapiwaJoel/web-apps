import { SelectOption } from '../common/select-option.type';

/** Select options for one assessment form, already cascaded. */
export interface AssessmentSelectOptions {
  papers: SelectOption[];
  topics: SelectOption[];
  subTopics: SelectOption[];
}
