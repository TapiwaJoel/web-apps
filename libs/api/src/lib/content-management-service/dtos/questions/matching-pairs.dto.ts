import { MatchItemDto } from './match-item.dto';
import { PairingDto } from './pairing.dto';

/**
 * Matching Pairs DTO
 *
 * Complete structure for MATCHING-type questions.
 * Based on industry standards (QTI, Moodle, Canvas LMS).
 *
 * Structure:
 * - Prompts: Left-side items (stems/questions)
 * - Matches: Right-side items (choices) - can include distractors
 * - Correct Pairings: Explicit associations between prompts and matches
 */
export interface MatchingPairsDto {
  prompts: MatchItemDto[];
  matches: MatchItemDto[];
  correctPairings: PairingDto[];
}
