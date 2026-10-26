import { SubTopicResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface SubTopicRow extends SubTopicResponseDto {
  statusTone: StatusTone;
  accessTone: StatusTone;
  topicName: string;
  subjectName: string;
  /** "Topic · Subject" display label. */
  topicLabel: string;
  hasArticle: boolean;
}
