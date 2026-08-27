export interface ReportArrivalDto {
  latitude?: number; // omitted when the device has no fix
  longitude?: number; // omitted when the device has no fix
}
