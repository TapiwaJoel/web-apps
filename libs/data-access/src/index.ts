export * from './lib/common';
export * from './lib/core';
export * from './lib/user-management-service';
export * from './lib/learning-management-service';
export * from './lib/content-management-service';
export * from './lib/messaging-service';
// content-management-service is the authoritative source for these DTOs; the
// learning-management-service copies are simplified duplicates kept for that
// module's own internal use. Explicit re-export resolves the `export *`
// ambiguity in favor of the authoritative content-management-service version.
export type {
  ArticleContentBlockDto,
  AttachedMediaItemDto,
  ArticleResponseDto,
} from './lib/content-management-service/dtos/articles';
