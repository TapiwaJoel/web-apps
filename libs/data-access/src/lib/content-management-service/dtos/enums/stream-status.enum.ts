/**
 * StreamStatus enum
 *
 * Represents the current state of a live stream
 */
export enum StreamStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

/**
 * SpeakerRole enum
 *
 * Defines the role of a speaker in a live stream
 */
export enum SpeakerRole {
  HOST = 'host',
  CO_HOST = 'co-host',
  PANELIST = 'panelist',
}

/**
 * ConnectionState enum
 *
 * Represents the connection status of a user in the stream
 */
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

/**
 * StreamAction enum
 *
 * Actions that can be performed on a stream
 */
export enum StreamAction {
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
}
