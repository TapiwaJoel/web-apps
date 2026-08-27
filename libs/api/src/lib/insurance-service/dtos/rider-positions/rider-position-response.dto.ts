export interface RiderPositionResponseDto {
  _id: string;
  riderId: string;
  jobId: string;
  latitude: number; // decimal degrees, -90 to 90
  longitude: number; // decimal degrees, -180 to 180
  recordedAt: string; // when the device took the fix, may precede createdAt
  createdAt: string;
}
