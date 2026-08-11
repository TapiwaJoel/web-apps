/**
 * Pairing DTO
 *
 * Represents a correct pairing between a prompt and a match in a matching question.
 */
export interface PairingDto {
  promptId: string;
  matchId: string;
  explanation?: string;
}
