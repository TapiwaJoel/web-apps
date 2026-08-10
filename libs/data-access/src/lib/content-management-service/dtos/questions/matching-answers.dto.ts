import { MatchItemDto } from './match-item.dto';
import { PairingDto } from './pairing.dto';

/**
 * Matching Answers DTO
 *
 * Used for MATCHING question type.
 * Structure based on industry standards (QTI, Moodle, Canvas LMS).
 * Minimum/maximum counts enforced by domain validator.
 */
export interface MatchingAnswersDto {
  answerType: 'MATCHING';
  prompts: MatchItemDto[];
  matches: MatchItemDto[];
  correctPairings: PairingDto[];
}
