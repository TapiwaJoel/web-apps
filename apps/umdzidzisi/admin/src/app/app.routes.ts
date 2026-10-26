import { Route } from '@angular/router';
import { LEARNING_MANAGEMENT_PATH } from '@mushaviri/api';
import {
  PreferencesComponent,
  ProfileComponent,
  RolesComponent,
  UsersComponent,
} from '@mushaviri/ui';
import { ADMIN_SERVICE_NAME } from '@mushaviri/util';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { DashboardHomeComponent } from './pages/dashboard-home.component';
import { PlaceholderPageComponent } from './pages/placeholder-page.component';
import { ExaminationBoardsComponent } from './pages/examination-boards/examination-boards.component';
import { EducationalLevelsComponent } from './pages/educational-levels/educational-levels.component';
import { GradesComponent } from './pages/grades/grades.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { TopicsComponent } from './pages/topics/topics.component';
import { SubTopicsComponent } from './pages/sub-topics/sub-topics.component';
import { ExaminationsComponent } from './pages/examinations/examinations.component';
import { ExaminationPapersComponent } from './pages/examination-papers/examination-papers.component';
import { AssessmentsComponent } from './pages/assessments/assessments.component';
import { GradingSystemsComponent } from './pages/grading-systems/grading-systems.component';
import { GradingScalesComponent } from './pages/grading-scales/grading-scales.component';
import { SubscriptionPlansComponent } from './pages/subscription-plans/subscription-plans.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { LearnerProfilesComponent } from './pages/learner-profiles/learner-profiles.component';

/**
 * Every learning-management resource page is routed at both `<path>` and
 * `<path>/:id` — the `:id` variant opens that record's detail drawer over the
 * same list component.
 */
export const appRoutes: Route[] = [
  {
    path: '',
    component: DashboardLayoutComponent,
    providers: [
      { provide: ADMIN_SERVICE_NAME, useValue: LEARNING_MANAGEMENT_PATH },
    ],
    children: [
      {
        path: 'dashboard',
        component: DashboardHomeComponent,
      },
      {
        path: 'curriculum',
        children: [
          { path: '', redirectTo: 'boards', pathMatch: 'full' },
          { path: 'boards', component: ExaminationBoardsComponent },
          { path: 'boards/:id', component: ExaminationBoardsComponent },
          { path: 'levels', component: EducationalLevelsComponent },
          { path: 'levels/:id', component: EducationalLevelsComponent },
          { path: 'grades', component: GradesComponent },
          { path: 'grades/:id', component: GradesComponent },
          { path: 'subjects', component: SubjectsComponent },
          { path: 'subjects/:id', component: SubjectsComponent },
          { path: 'topics', component: TopicsComponent },
          { path: 'topics/:id', component: TopicsComponent },
          { path: 'sub-topics', component: SubTopicsComponent },
          { path: 'sub-topics/:id', component: SubTopicsComponent },
        ],
      },
      {
        path: 'examinations',
        children: [
          { path: '', redirectTo: 'all', pathMatch: 'full' },
          { path: 'all', component: ExaminationsComponent },
          { path: 'all/:id', component: ExaminationsComponent },
          { path: 'papers', component: ExaminationPapersComponent },
          { path: 'papers/:id', component: ExaminationPapersComponent },
          { path: 'assessments', component: AssessmentsComponent },
          { path: 'assessments/:id', component: AssessmentsComponent },
          { path: 'grading-systems', component: GradingSystemsComponent },
          { path: 'grading-systems/:id', component: GradingSystemsComponent },
          { path: 'grading-scales', component: GradingScalesComponent },
          { path: 'grading-scales/:id', component: GradingScalesComponent },
        ],
      },
      {
        path: 'subscriptions',
        children: [
          { path: '', redirectTo: 'plans', pathMatch: 'full' },
          { path: 'plans', component: SubscriptionPlansComponent },
          { path: 'plans/:id', component: SubscriptionPlansComponent },
          { path: 'all', component: SubscriptionsComponent },
          { path: 'all/:id', component: SubscriptionsComponent },
        ],
      },
      {
        path: 'learners',
        children: [
          { path: '', redirectTo: 'profiles', pathMatch: 'full' },
          { path: 'profiles', component: LearnerProfilesComponent },
          { path: 'profiles/:id', component: LearnerProfilesComponent },
        ],
      },
      // Admin: users & roles (`:id` opens the detail drawer)
      {
        path: 'users',
        children: [
          { path: '', component: UsersComponent },
          { path: ':id', component: UsersComponent },
        ],
      },
      {
        path: 'roles',
        children: [
          { path: '', component: RolesComponent },
          { path: ':id', component: RolesComponent },
        ],
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'settings',
        component: PlaceholderPageComponent,
        data: { title: 'Settings' },
      },
      {
        path: 'preferences',
        component: PreferencesComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
