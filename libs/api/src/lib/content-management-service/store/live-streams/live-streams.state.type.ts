import { StreamResponseDto } from '../../dtos';

export interface LiveStreamsState {
  liveStreams: StreamResponseDto[];
  liveStreamsLoaded: boolean;
  liveStreamsLoading: boolean;
  liveStreamsError: string | null;
}
