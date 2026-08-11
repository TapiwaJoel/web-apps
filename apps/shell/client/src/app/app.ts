import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService, TitleService } from '@mushaviri/util';

@Component({
  selector: 'org-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private themeService: ThemeService = inject(ThemeService);
  private titleService: TitleService = inject(TitleService);
  private router: Router = inject(Router);

  public ngOnInit(): void {
    // Subscribe to router events to change theme based on route
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event: NavigationEnd) => {
        this.themeService.setThemeFromRoute(event.url);
      });

    // Set theme for initial route
    this.themeService.setThemeFromRoute(this.router.url);
  }
}
