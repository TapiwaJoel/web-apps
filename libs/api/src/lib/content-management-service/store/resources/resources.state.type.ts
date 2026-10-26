import { AnyResourceResponseDto } from '../../dtos';

export interface ResourcesState {
  resources: AnyResourceResponseDto[];
  resourcesLoaded: boolean;
  resourcesLoading: boolean;
  resourcesError: string | null;
}
