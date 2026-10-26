import { ContentStatus } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const CONTENT_STATUS_OPTIONS: SelectOption<ContentStatus>[] = [
  { value: ContentStatus.DRAFT, label: 'Draft' },
  { value: ContentStatus.PUBLISHED, label: 'Published' },
  { value: ContentStatus.ARCHIVED, label: 'Archived' },
];
