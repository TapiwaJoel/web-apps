import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@mushaviri/util';
import {
  readMode,
  resolveTheme,
} from './dashboard/components/theme-preference';

@Component({
  imports: [RouterModule],
  selector: 'org-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppComponent implements OnInit {
  protected title: string = 'umdzidzisi-admin';

  private themeService: ThemeService = inject(ThemeService);

  public ngOnInit(): void {
    // Apply the saved (or system) theme preference on first paint — no flash.
    this.themeService.setTheme(resolveTheme(readMode()));
  }
}
