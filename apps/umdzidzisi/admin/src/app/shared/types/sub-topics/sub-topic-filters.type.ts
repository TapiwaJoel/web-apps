export interface SubTopicFilters {
  topicId: string;
  status: string;
  accessLevel: string;
  /** `''` (any), `'linked'` or `'none'`. */
  article: string;
  createdFrom: string | null;
  createdTo: string | null;
}
