/**
 * Match Item DTO
 *
 * Represents a single item in a matching question (prompt or match option).
 */
export interface MatchItemDto {
  id: string;
  content: string;
  order: number;
}
