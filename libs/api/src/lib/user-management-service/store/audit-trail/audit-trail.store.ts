import { inject, Signal, Type } from '@angular/core';
import {
  patchState,
  signalStore,
  StateSignals,
  StateSource,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import { AuditTrailResponseDto } from '../../dtos';
import { AuditTrailService } from '../../services';
import { PaginateResult } from '../../../common';
import { AuditTrailState } from './audit-trail.state.type';

const initialState: AuditTrailState = {
  auditTrail: [],
  auditTrailLoaded: false,
  auditTrailLoading: false,
  auditTrailError: null,
  myAuditTrail: [],
  myAuditTrailLoaded: false,
  myAuditTrailLoading: false,
  myAuditTrailError: null,
};

function toErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Shared audit trail state for insurance-admin.
 *
 * Loaded once and kept in this root singleton; pages needing a scoped view
 * (e.g. a single user's activity) filter the in-memory list themselves,
 * since the backend does not yet support server-side filtering.
 */
export const AuditTrailStore: Type<
  {
    auditTrail: Signal<AuditTrailResponseDto[]>;
    auditTrailLoaded: Signal<boolean>;
    auditTrailLoading: Signal<boolean>;
    auditTrailError: Signal<string | null>;
    loadAuditTrail: () => void;
    myAuditTrail: Signal<AuditTrailResponseDto[]>;
    myAuditTrailLoaded: Signal<boolean>;
    myAuditTrailLoading: Signal<boolean>;
    myAuditTrailError: Signal<string | null>;
    loadMyAuditTrail: () => void;
  } & StateSource<AuditTrailState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<AuditTrailState> &
        WritableStateSource<AuditTrailState>,
      auditTrailService: AuditTrailService = inject(AuditTrailService),
    ): {
      loadAuditTrail: () => void;
      loadMyAuditTrail: () => void;
    } => ({
      loadAuditTrail(): void {
        if (store.auditTrailLoaded() || store.auditTrailLoading()) {
          return;
        }
        patchState(store, { auditTrailLoading: true, auditTrailError: null });
        auditTrailService.list().subscribe({
          next: (result: PaginateResult<AuditTrailResponseDto>): void => {
            patchState(store, {
              auditTrail: result.docs,
              auditTrailLoaded: true,
              auditTrailLoading: false,
            });
          },
          error: (error: unknown): void => {
            patchState(store, {
              auditTrailLoading: false,
              auditTrailError: toErrorMessage(error),
            });
          },
        });
      },

      loadMyAuditTrail(): void {
        if (store.myAuditTrailLoaded() || store.myAuditTrailLoading()) {
          return;
        }
        patchState(store, {
          myAuditTrailLoading: true,
          myAuditTrailError: null,
        });
        auditTrailService.me().subscribe({
          next: (result: PaginateResult<AuditTrailResponseDto>): void => {
            patchState(store, {
              myAuditTrail: result.docs,
              myAuditTrailLoaded: true,
              myAuditTrailLoading: false,
            });
          },
          error: (error: unknown): void => {
            patchState(store, {
              myAuditTrailLoading: false,
              myAuditTrailError: toErrorMessage(error),
            });
          },
        });
      },
    }),
  ),
);
