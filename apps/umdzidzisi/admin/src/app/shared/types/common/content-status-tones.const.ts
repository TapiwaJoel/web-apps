import { ContentStatus } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export const CONTENT_STATUS_TONES: Record<ContentStatus, StatusTone> = {
  [ContentStatus.PUBLISHED]: 'success',
  [ContentStatus.DRAFT]: 'info',
  [ContentStatus.ARCHIVED]: 'warning',
};
