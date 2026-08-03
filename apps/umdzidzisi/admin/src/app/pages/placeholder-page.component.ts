import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'umdzidzisi-placeholder-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
      <div class="max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div class="mb-4">
          <svg
            class="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 class="mb-2 text-2xl font-bold text-gray-800">{{ pageTitle }}</h2>
        <p class="mb-4 text-gray-600">This page is under construction.</p>
        <p class="text-sm text-gray-500">Content coming soon...</p>
        <div class="mt-6 text-xs text-gray-400">
          Route:
          <code class="rounded bg-gray-100 px-2 py-1">{{ currentRoute }}</code>
        </div>
      </div>
    </div>
  `,
})
export class PlaceholderPageComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  protected readonly pageTitle: string =
    this.route.snapshot.data['title'] || 'Page';
  protected readonly currentRoute: string = window.location.pathname;
}
