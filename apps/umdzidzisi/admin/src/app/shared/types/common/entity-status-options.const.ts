import { EntityStatus } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const ENTITY_STATUS_OPTIONS: SelectOption<EntityStatus>[] = [
  { value: EntityStatus.ACTIVE, label: 'Active' },
  { value: EntityStatus.INACTIVE, label: 'Inactive' },
  { value: EntityStatus.DELETED, label: 'Deleted' },
];
