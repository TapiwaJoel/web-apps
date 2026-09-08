/**
 * A single header notification (dummy, in-memory).
 * `icon` is a Flaticon regular-rounded class (e.g. 'fi fi-rr-bell').
 * `time` is a pre-formatted relative label (e.g. '2m', '1h', '1d').
 */
export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}
