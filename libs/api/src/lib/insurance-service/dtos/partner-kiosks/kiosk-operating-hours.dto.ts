export interface KioskOperatingHoursDto {
  dayOfWeek: number; // 0-6, 0 is Sunday (Date.getDay())
  opensAt: string; // 'HH:mm' 24-hour
  closesAt: string; // 'HH:mm' 24-hour
}
