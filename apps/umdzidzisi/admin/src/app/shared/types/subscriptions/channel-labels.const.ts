import { CommunicationChannel } from '@mushaviri/api';

export const CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  [CommunicationChannel.EMAIL]: 'Email',
  [CommunicationChannel.SMS]: 'SMS',
  [CommunicationChannel.IN_APP]: 'In-app',
  [CommunicationChannel.PUSH]: 'Push',
};
