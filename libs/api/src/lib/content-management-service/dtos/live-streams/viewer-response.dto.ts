export interface ViewerResponseDto {
  _id: string;
  streamId: string;
  userId: string | null;
  displayName: string | null;
  handRaisedAt: string | null;
  promotedToSpeaker: boolean;
  watchDuration: number;
  joinedAt: string;
  leftAt: string | null;
}
