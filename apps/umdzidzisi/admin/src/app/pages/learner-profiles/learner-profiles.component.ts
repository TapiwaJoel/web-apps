import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  CreateProfileDto,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  GradeResponseDto,
  GradesStore,
  ProfileResponseDto,
  ProfilesStore,
  ProfileType,
  SystemUserResponseDto,
  UsersStore,
} from '@mushaviri/api';
import {
  ADMIN_SERVICE_NAME,
  ColumnFilter,
  dateRangePredicate,
  equalsPredicate,
  filterRows,
  GlobalSearchService,
  isDateRangeActive,
  paginateRows,
  searchRows,
  sortRows,
  SortDirection,
} from '@mushaviri/util';
import {
  KpiCard,
  KpiStatCardComponent,
  NotificationService,
  SortableColumnHeaderComponent,
  StatusPillComponent,
  TablePaginationComponent,
} from '@mushaviri/ui';
import { CreateLearnerProfileDialogComponent } from './create-learner-profile-dialog/create-learner-profile-dialog.component';
import { LearnerProfileDetailDrawerComponent } from './learner-profile-detail-drawer/learner-profile-detail-drawer.component';
import { LearnerProfileRow } from '../../shared/types/learner-profiles/learner-profile-row.type';
import { LearnerProfileFilters } from '../../shared/types/learner-profiles/learner-profile-filters.type';
import { LearnerProfileColumnKey } from '../../shared/types/learner-profiles/learner-profile-column-key.type';
import { INITIAL_LEARNER_PROFILE_FILTERS } from '../../shared/types/learner-profiles/initial-learner-profile-filters.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { PROFILE_TYPE_OPTIONS } from '../../shared/types/common/profile-type-options.const';
import { ENTITY_STATUS_OPTIONS } from '../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../shared/types/common/entity-status-tones.const';

const DEFAULT_PAGE_SIZE: number = 10;

function toNameMap<T extends { _id: string; name: string }>(
  items: T[],
): Map<string, string> {
  return new Map(
    items.map((item: T): [string, string] => [item._id, item.name]),
  );
}

@Component({
  selector: 'org-learner-profiles',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateLearnerProfileDialogComponent,
    LearnerProfileDetailDrawerComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './learner-profiles.component.html',
})
export class LearnerProfilesComponent {
  // Injected services
  private readonly store: InstanceType<typeof ProfilesStore> =
    inject(ProfilesStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
  private readonly gradesStore: InstanceType<typeof GradesStore> =
    inject(GradesStore);
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  // State
  protected readonly typeOptions: SelectOption<ProfileType>[] =
    PROFILE_TYPE_OPTIONS;
  protected readonly statusOptions: SelectOption[] = ENTITY_STATUS_OPTIONS;

  protected readonly selectedProfileId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly profiles: Signal<ProfileResponseDto[]> =
    this.store.profiles;
  protected readonly profilesLoading: Signal<boolean> =
    this.store.profilesLoading;
  protected readonly profilesError: Signal<string | null> =
    this.store.profilesError;
  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.educationalLevelsStore.educationalLevels;
  protected readonly grades: Signal<GradeResponseDto[]> =
    this.gradesStore.grades;
  protected readonly users: Signal<SystemUserResponseDto[]> =
    this.usersStore.users;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<LearnerProfileFilters> = signal({
    ...INITIAL_LEARNER_PROFILE_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<LearnerProfileColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  private readonly typeLabels: Map<string, string> = new Map(
    PROFILE_TYPE_OPTIONS.map((option: SelectOption): [string, string] => [
      option.value,
      option.label,
    ]),
  );

  // Computed signals
  private readonly userNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(() => toNameMap(this.users()));

  private readonly levelNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(() => toNameMap(this.educationalLevels()));

  private readonly gradeNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(() => toNameMap(this.grades()));

  protected readonly rows: Signal<LearnerProfileRow[]> = computed<
    LearnerProfileRow[]
  >(() =>
    this.profiles().map((profile: ProfileResponseDto): LearnerProfileRow => ({
      ...profile,
      statusTone: ENTITY_STATUS_TONES[profile.status] ?? 'info',
      userName:
        this.userNamesById().get(profile.systemUser) ?? profile.systemUser,
      typeLabel: this.typeLabels.get(profile.type) ?? profile.type,
      educationalLevelName: profile.educationalLevel
        ? (this.levelNamesById().get(profile.educationalLevel) ??
          profile.educationalLevel)
        : '',
      gradeName: profile.grade
        ? (this.gradeNamesById().get(profile.grade) ?? profile.grade)
        : '',
    })),
  );

  protected readonly profileStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: LearnerProfileRow[] = this.rows();
      const countOf: (type: ProfileType) => number = (
        type: ProfileType,
      ): number =>
        all.filter((row: LearnerProfileRow): boolean => row.type === type)
          .length;
      return [
        {
          label: 'All profiles',
          value: String(all.length),
          icon: 'fi fi-rr-users',
        },
        {
          label: 'Students',
          value: String(countOf(ProfileType.STUDENT)),
          icon: 'fi fi-rr-graduation-cap',
        },
        {
          label: 'Tutors',
          value: String(countOf(ProfileType.TUTOR)),
          icon: 'fi fi-rr-chalkboard-user',
        },
        {
          label: 'Admins',
          value: String(countOf(ProfileType.ADMIN)),
          icon: 'fi fi-rr-shield-check',
        },
      ];
    },
  );

  /** Grades offered in the filter popover, narrowed by the chosen level. */
  protected readonly filterGradeOptions: Signal<GradeResponseDto[]> = computed<
    GradeResponseDto[]
  >(() => {
    const levelId: string = this.filters().educationalLevel;
    const grades: GradeResponseDto[] = levelId
      ? this.grades().filter(
          (grade: GradeResponseDto): boolean =>
            grade.educationalLevelId === levelId,
        )
      : this.grades();
    return [...grades].sort(
      (a: GradeResponseDto, b: GradeResponseDto): number =>
        a.displayOrder - b.displayOrder,
    );
  });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () => {
      const current: LearnerProfileFilters = this.filters();
      return (
        [
          current.type,
          current.status,
          current.educationalLevel,
          current.grade,
        ].filter((value: string): boolean => value !== '').length +
        (isDateRangeActive({ from: current.createdFrom, to: current.createdTo })
          ? 1
          : 0)
      );
    },
  );

  private readonly columnFilters: Signal<ColumnFilter<LearnerProfileRow>[]> =
    computed<ColumnFilter<LearnerProfileRow>[]>(() => {
      const current: LearnerProfileFilters = this.filters();
      return [
        {
          accessor: (row: LearnerProfileRow): string => row.type,
          predicate: equalsPredicate,
          value: current.type,
        },
        {
          accessor: (row: LearnerProfileRow): string => row.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (row: LearnerProfileRow): string =>
            row.educationalLevel ?? '',
          predicate: equalsPredicate,
          value: current.educationalLevel,
        },
        {
          accessor: (row: LearnerProfileRow): string => row.grade ?? '',
          predicate: equalsPredicate,
          value: current.grade,
        },
        {
          accessor: (row: LearnerProfileRow): Date => new Date(row.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<LearnerProfileRow[]> = computed<
    LearnerProfileRow[]
  >(() =>
    searchRows(
      filterRows(this.rows(), this.columnFilters()),
      this.globalSearch.query(),
      [
        (row: LearnerProfileRow): string => row.userName,
        (row: LearnerProfileRow): string => row.typeLabel,
        (row: LearnerProfileRow): string => row.educationalLevelName,
        (row: LearnerProfileRow): string => row.gradeName,
        (row: LearnerProfileRow): string => row.bio ?? '',
        (row: LearnerProfileRow): string => row.status,
      ],
    ),
  );

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<LearnerProfileRow[]> = computed<
    LearnerProfileRow[]
  >(() => {
    const key: LearnerProfileColumnKey | null = this.sortKey();
    const accessor: ((row: LearnerProfileRow) => unknown) | null = key
      ? (row: LearnerProfileRow): unknown =>
          key === 'createdAt' ? new Date(row.createdAt) : row[key] || null
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<LearnerProfileRow[]> = computed<
    LearnerProfileRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  // Constructor
  public constructor() {
    this.store.loadProfiles();
    this.educationalLevelsStore.loadEducationalLevels();
    this.gradesStore.loadGrades();
    this.usersStore.loadUsers({ serviceName: this.serviceName });

    this.globalSearch.placeholder.set('Search learner profiles…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });
  }

  // Public methods
  protected openCreateForm(): void {
    this.showDialog.set(true);
  }

  protected cancelDialog(): void {
    this.showDialog.set(false);
  }

  protected submitDialog(dto: CreateProfileDto): void {
    this.saving.set(true);
    this.store.createProfile(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: `${this.typeLabels.get(dto.type) ?? dto.type} profile created.`,
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof LearnerProfileFilters>(
    key: K,
    value: LearnerProfileFilters[K],
  ): void {
    this.filters.update(
      (current: LearnerProfileFilters): LearnerProfileFilters => ({
        ...current,
        [key]: value,
        // A grade belongs to one level, so a new level clears the grade.
        ...(key === 'educationalLevel' ? { grade: '' } : {}),
      }),
    );
    this.page.set(1);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_LEARNER_PROFILE_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: LearnerProfileColumnKey,
    direction: SortDirection,
  ): void {
    this.sortKey.set(direction ? key : null);
    this.sortDirection.set(direction);
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  protected toggleMenu(id: string): void {
    this.openMenuId.update((current: string | null): string | null =>
      current === id ? null : id,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
