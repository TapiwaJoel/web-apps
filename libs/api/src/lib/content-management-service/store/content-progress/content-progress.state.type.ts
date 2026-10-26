import { ContentProgressResponseDto } from '../../dtos';

export interface ContentProgressState {
  contentProgress: ContentProgressResponseDto[];
  contentProgressLoaded: boolean;
  contentProgressLoading: boolean;
  contentProgressError: string | null;
}
